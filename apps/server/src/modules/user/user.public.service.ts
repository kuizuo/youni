import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'

import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { resourceNotFoundWrapper } from '@server/utils/prisma.util'
import Redis from 'ioredis'

import { UserSelect } from './user.constant'

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
        gender: true,
        yoId: true,
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
