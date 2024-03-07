import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'
import { getRedisKey } from '@server/utils/redis.util'
import Redis from 'ioredis'

import { InteractType } from '../interact.constant'

@Injectable()
export class ViewService {
  constructor(@InjectRedis() private redis: Redis) {}

  async addView(type: InteractType, itemId: number, uid: number): Promise<void> {
    await this.redis.pfadd(getRedisKey(`${type}:${itemId}:views`), uid)
  }

  async countViews(type: InteractType, itemId: number): Promise<number> {
    return +await this.redis.pfcount(getRedisKey(`${type}:${itemId}:views`))
  }
}
