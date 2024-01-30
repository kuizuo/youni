import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorEnum } from '@server/constants/error-code.constant'

import { RegisterDto } from '@server/modules/auth/auth.dto'

import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { resourceNotFoundWrapper } from '@server/utils/prisma.util'
import { compareSync, hashSync } from 'bcrypt'
import Redis from 'ioredis'
import { isEmpty } from 'lodash'

import { Role } from '../auth/auth.constant'
import { UpdateProfileDto } from '../auth/dtos/account.dto'

import { PasswordUpdateDto } from './dto/password.dto'
import { UserDto, UserQueryDto } from './dto/user.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectPrismaClient()
    private readonly prisma: ExtendedPrismaClient,

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
          role: true,
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
  }

  async forceUpdatePassword(uid: string, password: string): Promise<void> {
    const user = await this.findUserById(uid)

    await this.prisma.user.update({
      where: { id: uid },
      data: {
        password: hashSync(password, 10),
      },
    })
  }

  async create({
    username,
    password,
    ...data
  }: UserDto) {
    const exist = await this.prisma.user.findFirst({ where: { username } })
    if (!isEmpty(exist))
      return exist

    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashSync(password, 10),
        ...data,
        role: Role.User,
      },
    })

    return user
  }

  async update(
    id: string,
    { password, status, ...data }: Partial<UserDto>,
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
    })
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
    })

    return user
  }

  async delete(userIds: string[]): Promise<void | never> {
    await this.prisma.user.deleteMany({
      where: {
        id: { in: userIds },
        role: { not: Role.Admin },
      },
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
    }).withPages({
      page,
      limit,
      includePageCount: true,
    })
  }

  async register({ username, type, ...data }: RegisterDto) {
    const exists = await this.prisma.user.exists({
      where: { username },
    })

    if (exists)
      throw new BizException(ErrorEnum.SYSTEM_USER_EXISTS)

    return await this.prisma.$transaction(async (tx) => {
      const password = hashSync(data.password, 10)

      const user = await tx.user.create({
        data: {
          ...data,
          username,
          password,
          status: 1,
          role: Role.User,
        },

      })

      return user
    })
  }
}
