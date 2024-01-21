import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { BadRequestException, Injectable } from '@nestjs/common'
import { compareSync, hashSync } from 'bcrypt'
import Redis from 'ioredis'
import { isEmpty } from 'lodash'

import { BizException } from '~/common/exceptions/biz.exception'
import { ErrorEnum } from '~/constants/error-code.constant'

import { RegisterDto } from '~/modules/auth/auth.dto'

import { ExtendedPrismaClient, InjectPrismaClient } from '~/shared/database/prisma.extension'

import { resourceNotFoundWrapper } from '~/utils/prisma.util'

import { UpdateProfileDto } from '../auth/dtos/account.dto'
import { RoleService } from '../system/role/role.service'

import { PasswordUpdateDto } from './dto/password.dto'
import { UserDto, UserQueryDto } from './dto/user.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectPrismaClient()
    private readonly prisma: ExtendedPrismaClient,

    private readonly roleService: RoleService,
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
    return await this.prisma.user
      .findUniqueOrThrow({
        select: {
          id: true,
          username: true,
          avatar: true,
          email: true,
          nickname: true,
          roles: {
            select: {
              id: true,
              name: true,
              value: true,
            },
          },
        },
        where: {
          id: uid,
        },
      })
      .catch(resourceNotFoundWrapper(new BizException(ErrorEnum.USER_NOT_FOUND)))
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
    const { oldPassword, newPassword } = dto
    const user = await this.findUserById(uid)

    const isSamePassword = compareSync(oldPassword, user.password)

    // 原密码不一致，不允许更改
    if (!isSamePassword)
      throw new BizException(ErrorEnum.PASSWORD_MISMATCH)

    await this.prisma.user.update({
      where: { id: uid },
      data: {
        password: hashSync(newPassword, 10),
      },
    })

    await this.upgradePasswordV(user.id)
  }

  async forceUpdatePassword(uid: string, password: string): Promise<void> {
    const user = await this.findUserById(uid)

    await this.prisma.user.update({
      where: { id: uid },
      data: {
        password: hashSync(password, 10),
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

    if (!roleIds)
      roleIds = ['1']

    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashSync(password, 10),
        ...data,
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

  async register({ username, type, ...data }: RegisterDto) {
    const exists = await this.prisma.user.exists({
      where: { username },
    })

    if (exists)
      throw new BizException(ErrorEnum.SYSTEM_USER_EXISTS)

    const defaultRole = await this.roleService.getDefaultRole()

    return await this.prisma.$transaction(async (tx) => {
      const password = hashSync(data.password, 10)

      const user = await tx.user.create({
        data: {
          ...data,
          username,
          password,
          status: 1,
          roles: {
            connect: { id: defaultRole!.id },
          },
        },

      })

      return user
    })
  }
}
