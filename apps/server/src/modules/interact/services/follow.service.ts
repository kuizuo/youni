import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'
import { PagerDto } from '@server/common/dto/pager.dto'
import { getRedisKey } from '@server/utils/redis.util'
import Redis from 'ioredis'
import { CursorPaginationMeta } from 'prisma-extension-pagination'

@Injectable()
export class FollowService {
  constructor(@InjectRedis() private redis: Redis) { }

  async follow(targetId: string, userId: string) {
    // 用户正在关注的人 如 following:2 为 用户2 正在关注的人
    await this.redis.sadd(getRedisKey(`following:${userId}`), targetId)

    // 用户的粉丝 如 follows:1 为 用户1 的粉丝
    await this.redis.sadd(getRedisKey(`followers:${targetId}`), userId)

    return true
  }

  async unfollow(targetId: string, userId: string) {
    await this.redis.srem(getRedisKey(`following:${userId}`), targetId)
    await this.redis.srem(getRedisKey(`followers:${targetId}`), userId)

    return true
  }

  /** 获取用户正在关注的用户 ID 列表。 */
  async getFollowingIds(userId: string, dto: PagerDto) {
    const { cursor = '0', limit } = dto

    const ids: string[] = []

    const [endCursor, keys] = await this.redis.sscan(getRedisKey(`following:${userId}`), cursor, 'COUNT', limit)
    ids.push(...keys)

    const meta: CursorPaginationMeta = {
      hasNextPage: endCursor !== '0',
      hasPreviousPage: false,
      startCursor: cursor,
      endCursor,
    }
    return { ids, meta }

    // return this.redis.smembers(`following:${userId}`)
  }

  /** 获取关注用户的粉丝 ID 列表。 */
  async getFollowerIds(userId: string, dto: PagerDto) {
    const { cursor = '0', limit } = dto

    const ids: string[] = []

    const [startCursor, keys] = await this.redis.sscan(getRedisKey(`followers:${userId}`), cursor, 'COUNT', limit)
    ids.push(...keys)

    const meta: CursorPaginationMeta = {
      hasNextPage: startCursor !== '0',
      hasPreviousPage: false,
      startCursor,
      endCursor: startCursor,
    }
    return { ids, meta }

    // return this.redis.smembers(`followers:${userId}`)
  }

  /** 获取用户正在关注的用户数量。 */
  async getFollowingCount(userId: string) {
    return this.redis.scard(getRedisKey(`following:${userId}`))
  }

  /** 获取用户的粉丝数量。 */
  async getFollowerCount(userId: string) {
    return this.redis.scard(getRedisKey(`followers:${userId}`))
  }

  /** 检查一个用户是否关注了另一个用户。 */
  async isUserFollowing(targetId: string, userId: string) {
    return !!(await this.redis.sismember(getRedisKey(`followers:${targetId}`), userId))
  }

  /** 获取共同关注列表 */
  async getCommonFollowingIds(targetId: string, userId: string) {
    return this.redis.sinter(getRedisKey(`following:${targetId}`), getRedisKey(`following:${userId}`))
  }

  /** 获取他的粉丝共同关注列表 */
  async getCommonFollowerIds(targetId: string, userId: string) {
    return this.redis.sinter(getRedisKey(`followers:${targetId}`), getRedisKey(`following:${userId}`))
  }
}
