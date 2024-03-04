import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class FollowService {
  constructor(@InjectRedis() private redis: Redis) { }

  async follow(targetId: number, uid: number) {
    // 用户正在关注的人 如 following:2 为 用户2 正在关注的人
    await this.redis.sadd(`following:${uid}`, targetId)

    // 用户的粉丝 如 follows:1 为 用户1 的粉丝
    await this.redis.sadd(`followers:${targetId}`, uid)
  }

  async unfollow(targetId: number, uid: number) {
    await this.redis.srem(`following:${uid}`, targetId)
    await this.redis.srem(`followers:${targetId}`, uid)
  }

  /** 获取用户正在关注的用户 ID 列表。 */
  async getFollowingIds(uid: number) {
    return this.redis.smembers(`following:${uid}`)
  }

  /** 获取关注用户的粉丝 ID 列表。 */
  async getFollowersIds(uid: number) {
    return this.redis.smembers(`followers:${uid}`)
  }

  /** 获取用户正在关注的用户数量。 */
  async getFollowingCount(uid: number) {
    return this.redis.scard(`following:${uid}`)
  }

  /** 获取关注用户的粉丝数量。 */
  async getFollowersCount(uid: number) {
    return this.redis.scard(`followers:${uid}`)
  }

  /** 检查一个用户是否关注了另一个用户。 */
  async isUserFollowing(targetId: number, uid: number): Promise<boolean> {
    return !!(await this.redis.sismember(`followers:${targetId}`, uid))
  }
}
