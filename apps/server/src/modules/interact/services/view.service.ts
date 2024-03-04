import Redis from 'ioredis'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'

import { InteractType } from '../interact.constant'

@Injectable()
export class ViewService {
  constructor(@InjectRedis() private redis: Redis) {}

  async addView(type: InteractType, itemId: number, uid: number): Promise<void> {
    await this.redis.pfadd(`${type}:${itemId}:views`, uid)
  }

  async countViews(type: InteractType, itemId: number): Promise<number> {
    return +await this.redis.pfcount(`${type}:${itemId}:views`)
  }
}
