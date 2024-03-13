import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'

import { PagerDto } from '@server/common/dto/pager.dto'
import { getRedisKey } from '@server/utils/redis.util'
import Redis from 'ioredis'

import { CursorPaginationMeta } from 'prisma-extension-pagination'

import { InteractType } from '../interact.constant'

@Injectable()
export class LikeService {
  constructor(@InjectRedis() private readonly redis: Redis) { }

  /**
   * 点赞
   * @param type 目标类型
   * @param id 目标 id
   * @param userId
   * @returns
   */
  async like(type: InteractType, id: string, userId: string) {
    const liked = await this.redis.sismember(getRedisKey(`${type}:${id}:users`), userId)

    if (liked)
      return false

    await this.redis.multi()
      // 统计条目点赞总数 (用于方便获取点赞数)
      .incr(getRedisKey(`${type}:${id}:likes`))
      // 添加用户到点赞列表 (用于获取是否点赞)
      .sadd(getRedisKey(`${type}:${id}:users`), userId)
      // 添加条目到用户已点赞列表 (用于获取用户已点赞条目)
      .sadd(getRedisKey(`u:${userId}:${type}:likes`), id)
      .exec()

    return true
  }

  async dislike(type: InteractType, id: string, userId: string) {
    const liked = await this.redis.sismember(getRedisKey(`${type}:${id}:users`), userId)

    if (liked) {
      await this.redis.multi()
        .decr(getRedisKey(`${type}:${id}:likes`))
        .srem(getRedisKey(`${type}:${id}:users`), userId)
        .srem(getRedisKey(`u:${userId}:${type}:likes`), id)
        .exec()

      return true
    }

    return false
  }

  /**
   * 获取条目已点赞数量
   * @param type 目标类型 (如 note)
   * @param id 目标 id (如 商品id)
   * @returns
   */
  async getItemlikedCount(type: InteractType, id: string) {
    const count = await this.redis.get(getRedisKey(`${type}:${id}:likes`))

    // 不考虑使用 scard, 因为 scard 会遍历整个集合, 会影响性能
    // const count = await this.redis.scard(`u:${type}:${id}:likes`);

    return count ? Number.parseInt(count, 10) : 0
  }

  /**
   * 获取条目是否已点赞
   * @param type 目标类型 (如 note)
   * @param id 目标 id (如 商品id)
   * @param userId
   * @returns
   */
  async getItemLiked(type: InteractType, id: string, userId: string) {
    return !!await this.redis.sismember(getRedisKey(`${type}:${id}:users`), userId)
  }

  /**
   * 获取用户已点赞 [条目]
   * @param type 目标类型 (如 note)
   * @param userId
   * @returns
   */
  async getUserLikedIds(dto: PagerDto, type: InteractType, userId: string) {
    const { cursor, limit } = dto

    const ids: string[] = []

    if (cursor === '') {
      return {
        ids: [],
        meta: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
      }
    }

    const [endCursor, keys] = await this.redis.sscan(getRedisKey(`u:${userId}:${type}:likes`), cursor || '', 'COUNT', limit)
    ids.push(...keys)

    const meta: CursorPaginationMeta = {
      hasNextPage: endCursor !== '0',
      hasPreviousPage: false,
      startCursor: cursor || '',
      endCursor,
    }
    return { ids, meta }

    // return this.redis.smembers(getRedisKey(`u:${userId}:${type}:likes`))
  }

  // /**
  //  * 获取用户获赞数量
  //  * @param type 目标类型 (如 note)
  //  * @param ids 目标 ids
  //  * @param userId
  //  * @returns
  //  * @todo
  //  */
  // async getUserLikesCount(type: InteractType, ids: string[], userId: string) {
  //   // 根据传入的ids 获取总点赞数量, 使用 Promise 并行
  //   const likesCounts = await Promise.all(
  //     ids.map(id =>
  //       this.redis.get(getRedisKey(`${type}:${id}:likes`)),
  //     ),
  //   )

  //   const totalLikesCount = likesCounts.reduce((total, count) => {
  //     // 确保 count 有值
  //     if (count) {
  //       // 将字符串类型的 count 转换为数字类型
  //       total += Number.parseInt(count, 10)
  //     }
  //     return total
  //   }, 0)
  //   return totalLikesCount
  // }
}
