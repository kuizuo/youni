import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'

import Redis from 'ioredis'

import { InteractType } from '../interact.constant'

@Injectable()
export class LikeService {
  constructor(@InjectRedis() private readonly redis: Redis) { }

  /**
   * 点赞
   * @param type 目标类型
   * @param itemId 目标 id
   * @param uid
   * @returns
   */
  async like(type: InteractType, itemId: string, uid: string): Promise<boolean> {
    const liked = await this.redis.sismember(`${type}:${itemId}:users`, uid)

    if (liked) {
      // 之前已点赞过, 则取消
      await this.redis.multi()
        .decr(`${type}:${itemId}:likes`)
        .srem(`${type}:${itemId}:users`, uid)
        .srem(`u:${uid}:${type}:likes`, itemId)
        .exec()

      return false
    }

    await this.redis.multi()
      // 统计条目点赞总数 (用于方便获取点赞数)
      .incr(`${type}:${itemId}:likes`)
      // 添加用户到点赞列表 (用于获取是否点赞)
      .sadd(`${type}:${itemId}:users`, uid)
      // 添加条目到用户已点赞列表 (用于获取用户已点赞条目)
      .sadd(`u:${uid}:${type}:likes`, itemId)
      .exec()

    return true
  }

  /**
   * 获取条目已点赞数量
   * @param type 目标类型 (如 product)
   * @param id 目标 id (如 商品id)
   * @returns
   */
  async getItemLikedCount(type: InteractType, itemId: string): Promise<number> {
    const count = await this.redis.get(`${type}:${itemId}:likes`)

    // 不考虑使用 scard, 因为 scard 会遍历整个集合, 会影响性能
    // const count = await this.redis.scard(`u:${type}:${itemId}:likes`);

    return count ? Number.parseInt(count, 10) : 0
  }

  /**
   * 获取条目是否已点赞
   * @param type 目标类型 (如 product)
   * @param itemId 目标 id (如 商品id)
   * @param uid
   * @returns
   */
  async getItemLiked(type: InteractType, itemId: string, uid: string): Promise<boolean> {
    return !!await this.redis.sismember(`${type}:${itemId}:users`, uid)
  }

  /**
   * 获取用户已点赞 [条目]
   * @param type 目标类型 (如 product)
   * @param uid
   * @returns
   */
  async getUserLikedIds(type: InteractType, uid: string): Promise<string[]> {
    return this.redis.smembers(`u:${uid}:${type}:likes`)
  }
}
