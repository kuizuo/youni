import { Injectable } from '@nestjs/common'
import { RedisKeys } from '@server/constants/cache.constant'
import { CacheService } from '@server/shared/cache/cache.service'
import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'
import { getRedisKey } from '@server/utils/redis.util'

import { HistoryCursorDto } from './history.dto'

@Injectable()
export class HistoryService {
  @InjectPrismaClient()
  private prisma: ExtendedPrismaClient

  constructor(
    private readonly cacheService: CacheService,
  ) { }

  async query(
    dto: HistoryCursorDto,
    userId: string,
  ) {
    const { cursor, limit } = dto

    return await this.prisma.history.paginate({
      where: {
        userId,
      },
      orderBy: {
        visitedAt: 'desc',
      },
    }).withCursor({
      limit,
      ...(cursor && { after: cursor }),
    })
  }

  async create(itemId: string, userId: string) {
    // 上次浏览时间
    const cacheKey = await getRedisKey(RedisKeys.View, `${itemId}:ip`)
    const lastViewedAt = await this.cacheService.get(cacheKey)

    if (lastViewedAt)
      return

    await this.cacheService.set(cacheKey, '1', 1 * 60 * 1000)

    const history = await this.prisma.history.findFirst({
      where: {
        noteId: itemId,
        userId,
      },
    })

    if (history) {
      await this.prisma.history.update({
        where: { id: history.id },
        data: { visitedAt: new Date() },
      })
    }
    else {
      await this.prisma.history.create({
        data: {
          noteId: itemId,
          userId,
        },
      })
    }
  }

  async batchDelete(ids: string[], userId: string) {
    return await this.prisma.history.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    })
  }
}