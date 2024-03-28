import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'
import { getRedisKey } from '@server/utils/redis.util'
import Redis from 'ioredis'

import { InteractType } from '../interact.constant'

@Injectable()
export class ViewService {
  constructor(@InjectRedis() private redis: Redis) { }

  async increase(type: InteractType, itemId: string, userId: string): Promise<void> {
    await this.redis.pfadd(getRedisKey(`${type}:${itemId}:views`), userId)
  }

  async count(type: InteractType, itemId: string): Promise<number> {
    return +await this.redis.pfcount(getRedisKey(`${type}:${itemId}:views`))
  }
}
