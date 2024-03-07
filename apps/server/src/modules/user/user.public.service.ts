import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'

import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { resourceNotFoundWrapper } from '@server/utils/prisma.util'
import { Prisma } from '@youni/database'
import Redis from 'ioredis'

const UserSelect: Prisma.UserSelect = {
  id: true,
  nickname: true,
  avatar: true,
  desc: true,
}

@Injectable()
export class UserPublicService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectPrismaClient()
    private readonly prisma: ExtendedPrismaClient,

  ) { }

  async getUserById(id: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        ...UserSelect,
      },
    }).catch(resourceNotFoundWrapper(
      new BizException(ErrorCodeEnum.UserNotFound),
    ))
  }

  async getUserByIds(ids: string[]) {
    return await this.prisma.user.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        ...UserSelect,
      },
    })
  }
}
