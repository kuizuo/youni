import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { isEmpty } from 'lodash'

import { BusinessException } from '~/common/exceptions/biz.exception'
import { ErrorEnum } from '~/constants/error-code.constant'

import { RegisterDto } from '~/modules/auth/dtos/auth.dto'

import { ExtendedPrismaClient } from '~/shared/database/prisma.extension'

import { md5 } from '~/utils/crypto.util'
import { resourceNotFoundWrapper } from '~/utils/prisma.util'

import { randomValue } from '~/utils/tool.util'

import { UpdateProfileDto } from '../auth/dtos/account.dto'
import { RoleService } from '../system/role/role.service'

import { PasswordUpdateDto } from './dto/password.dto'
import { UserDto, UserQueryDto } from './dto/user.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRedis() private redis: Redis,
    @Inject('PRISMA_CLIENT') private prisma: ExtendedPrismaClient,
    private roleService: RoleService,
  ) {}

  async findUserById(id: string) {
    return await this.prisma.user.findUniqueOrThrow({ where: { id } })
  }

  async findUserByUsername(username: string) {
    return await this.prisma.user.findUniqueOrThrow({ where: { username } })
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUniqueOrThrow({ where: { email } })
  }

  async getProfile(uid: string) {
    const user = await this.prisma.user
      .findUnique({
        select: {
          avatar: true,
          email: true,
          nickname: true,
        },
        where: {
          id: uid,
        },
        include: { roles: true },
      })
      .catch(resourceNotFoundWrapper(new BusinessException(ErrorEnum.USER_NOT_FOUND)))

    return user
  }

  async updateProfile(uid: string, info: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: uid },
      data: {
        ...(info.nickname && { nickname: info.nickname }),
        ...(info.avatar && { avatar: info.avatar }),
        ...(info.phone && { phone: info.phone }),
      },
    })

    return user
  }

  async updatePassword(uid: string, dto: PasswordUpdateDto): Promise<void> {
    const user = await this.findUserById(uid)

    const comparePassword = md5(`${dto.oldPassword}${user.psalt}`)
    // 原密码不一致，不允许更改
    if (user.password !== comparePassword)
      throw new BusinessException(ErrorEnum.PASSWORD_MISMATCH)

    const password = md5(`${dto.newPassword}${user.psalt}`)
    await this.prisma.user.update({
      where: { id: uid },
      data: {
        password,
      },
    })

    await this.upgradePasswordV(user.id)
  }

  async forceUpdatePassword(uid: string, password: string): Promise<void> {
    const user = await this.findUserById(uid)

    const newPassword = md5(`${password}${user.psalt}`)
    await this.prisma.user.update({
      where: { id: uid },
      data: {
        password: newPassword,
      },
    })
    await this.upgradePasswordV(user.id)
  }

  async create({
    username,
    password,
    roleIds,
    ...data
  }: UserDto) {
    const exist = await this.prisma.user.findFirst({ where: { username } })
    if (!isEmpty(exist))
      return exist

    const psalt = randomValue(32)

    const user = await this.prisma.user.create({
      data: {
        username,
        password,
        ...data,
        psalt,
        roles: {
          connect: roleIds.map(id => ({ id })),
        },
      },
    })

    return user
  }

  async update(
    id: string,
    { password, roleIds, status, ...data }: Partial<UserDto>,
  ) {
    await this.prisma.$transaction(async (tx) => {
      if (password)
        await this.forceUpdatePassword(id, password)

      await tx.user.update({
        where: { id },
        data: {
          ...data,
          status,
        },
      })

      const user = await tx.user.findUnique({
        where: { id },
        include: {
          roles: true,
        },
      })

      await this.prisma.user.update({
        where: { id },
        data: {
          roles: {
            connect: roleIds?.map(roleId => ({ id: roleId })),
            disconnect: user?.roles.filter(role => !roleIds?.includes(role.id)).map(role => ({ id: role.id })),
          },
        },
      })
    })
    if (status === 0) {
      // 禁用状态
      await this.forbidden(id)
    }
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        username: true,
        status: true,
      },
      where: {
        id,
      },
      include: {
        roles: true,
      },
    })

    return user
  }

  async delete(userIds: string[]): Promise<void | never> {
    // FIXME:
    if (userIds.includes(''))
      throw new BadRequestException('不能删除root用户!')

    await this.prisma.user.deleteMany({
      where: { id: { in: userIds } },
    })
  }

  async paginate(dto: UserQueryDto) {
    const {
      page,
      limit,
      keyword,
      status,
    } = dto

    return await this.prisma.user.paginate({
      where: {
        ...(keyword && { username: { contains: keyword } }),
        ...(keyword && { nickname: { contains: keyword } }),
        ...(keyword && { email: { contains: keyword } }),
        ...(status && { status }),
      },
      include: {
        roles: true,
      },
    }).withPages({
      page,
      limit,
      includePageCount: true,
    })
  }

  async forbidden(uid: string): Promise<void> {
    await this.redis.del(`admin:passwordVersion:${uid}`)
    await this.redis.del(`admin:token:${uid}`)
    await this.redis.del(`admin:perms:${uid}`)
  }

  async multiForbidden(uids: string[]): Promise<void> {
    if (uids) {
      const pvs: string[] = []
      const ts: string[] = []
      const ps: string[] = []
      uids.forEach((e) => {
        pvs.push(`admin:passwordVersion:${e}`)
        ts.push(`admin:token:${e}`)
        ps.push(`admin:perms:${e}`)
      })
      await this.redis.del(pvs)
      await this.redis.del(ts)
      await this.redis.del(ps)
    }
  }

  async upgradePasswordV(id: string): Promise<void> {
    // admin:passwordVersion:${param.id}
    const v = await this.redis.get(`admin:passwordVersion:${id}`)
    if (v)
      await this.redis.set(`admin:passwordVersion:${id}`, Number.parseInt(v) + 1)
  }

  async exist(username: string) {
    const exists = await this.prisma.user.exists({
      where: { username },
    })

    return exists
  }

  async register({ username, ...data }: RegisterDto) {
    const exists = await this.prisma.user.exists({
      where: { username },
    })
    if (!isEmpty(exists))
      throw new BusinessException(ErrorEnum.SYSTEM_USER_EXISTS)

    return await this.prisma.$transaction(async (tx) => {
      const salt = randomValue(32)

      const password = md5(`${data.password ?? 'a123456'}${salt}`)

      const user = tx.user.create({
        data: {
          ...data,
          username,
          password,
          psalt: salt,
          status: 1,
        },
      })

      return user
    })
  }
}
