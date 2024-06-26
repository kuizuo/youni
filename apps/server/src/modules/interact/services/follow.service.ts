import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PagerDto } from '@server/common/dto/pager.dto'
import { getRedisKey } from '@server/utils/redis.util'
import Redis from 'ioredis'
import { CursorPaginationMeta } from 'prisma-extension-pagination'

import { UserFollowEvent } from '../events/user-follow.event'
import { InteractEvents } from '../interact.constant'

@Injectable()
export class FollowService {
  constructor(
    @InjectRedis() private redis: Redis,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async follow(targetId: string, userId: string) {
    const now = Date.now()

    // 用户正在关注的人 如 following:2 为 用户2 正在关注的人
    await this.redis.zadd(getRedisKey(`following:${userId}`), now, targetId)

    // 用户的粉丝 如 follows:1 为 用户1 的粉丝
    await this.redis.zadd(getRedisKey(`followers:${targetId}`), now, userId)

    this.eventEmitter.emit(InteractEvents.UserFollow, new UserFollowEvent({
      targetId,
      userId,
    }))
    return true
  }

  async unfollow(targetId: string, userId: string) {
    await this.redis.zrem(getRedisKey(`following:${userId}`), targetId)
    await this.redis.zrem(getRedisKey(`followers:${targetId}`), userId)

    return true
  }

  /** 获取用户正在关注的用户 ID 列表。 */
  async getFollowingIds(dto: PagerDto, userId: string) {
    const { cursor = '+inf', limit } = dto

    const ids: string[] = []

    const startCursor = cursor !== '0' ? cursor : '+inf'
    const keys = await this.redis.zrevrangebyscore(
      getRedisKey(`following:${userId}`),
      startCursor,
      '-inf',
      'LIMIT',
      0,
      limit,
    )
    ids.push(...keys)

    const meta: CursorPaginationMeta = {
      hasNextPage: ids.length === limit,
      hasPreviousPage: cursor !== '0',
      startCursor: ids.length > 0 ? ids[0] : '0',
      endCursor: ids.length > 0 ? ids[ids.length - 1] : '0',
    }
    return { ids, meta }
  }

  async getAllFollowingIds(userId: string) {
    return this.redis.zrange(getRedisKey(`following:${userId}`), 0, -1)
  }

  /** 获取关注用户的粉丝 ID 列表。 */
  async getFollowerIds(userId: string, dto: PagerDto) {
    const { cursor = '+inf', limit } = dto

    const ids: string[] = []

    const startCursor = cursor !== '0' ? cursor : '+inf'
    const keys = await this.redis.zrevrangebyscore(
      getRedisKey(`followers:${userId}`),
      startCursor,
      '-inf',
      'LIMIT',
      0,
      limit,
    )
    ids.push(...keys)

    const meta: CursorPaginationMeta = {
      hasNextPage: ids.length === limit,
      hasPreviousPage: cursor !== '0',
      startCursor: ids.length > 0 ? ids[0] : '0',
      endCursor: ids.length > 0 ? ids[ids.length - 1] : '0',
    }
    return { ids, meta }
  }

  /** 获取用户正在关注的用户数量。 */
  async getFollowingCount(userId: string) {
    return this.redis.zcard(getRedisKey(`following:${userId}`))
  }

  /** 获取用户的粉丝数量。 */
  async getFollowerCount(userId: string) {
    return this.redis.zcard(getRedisKey(`followers:${userId}`))
  }

  /** 检查一个用户是否关注了另一个用户。 */
  async isUserFollowing(targetId: string, userId: string) {
    return !!(await this.redis.zscore(getRedisKey(`following:${userId}`), targetId))
  }

  /** 获取共同关注列表 */
  async getCommonFollowingIds(targetId: string, userId: string) {
    return this.redis.zinter(2, getRedisKey(`following:${targetId}`), getRedisKey(`following:${userId}`))
  }

  /** 获取他的粉丝共同关注列表 */
  async getCommonFollowerIds(targetId: string, userId: string) {
    return this.redis.zinter(2, getRedisKey(`followers:${targetId}`), getRedisKey(`following:${userId}`))
  }
}
