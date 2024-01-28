import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Redis } from 'ioredis'

import { BizException } from '~/common/exceptions/biz.exception'

import { RedisKeys } from '~/constants/cache.constant'

import { ErrorEnum } from '~/constants/error-code.constant'

import { getRedisKey } from '~/utils/redis.util'

@Injectable()
export class TokenService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,

    private readonly jwtService: JwtService,
  ) {}

  async generateToken(payload: IAuthUser, otherInfo?: any) {
    const token = this.jwtService.sign(payload)

    // store in redis
    await this.redis.hset(
      getRedisKey(RedisKeys.JWTStore),
      payload.uid,
      JSON.stringify({
        token,
        date: new Date().toISOString(),
        ...otherInfo,
      }),
    )

    return token
  }

  async isTokenInRedis(uid: string) {
    if (!uid)
      return false
    const key = getRedisKey(RedisKeys.JWTStore)
    const has = await this.redis.hexists(key, uid)
    return !!has
  }

  async removeToken(uid: string) {
    const key = getRedisKey(RedisKeys.JWTStore)

    await this.redis.hdel(
      key,
      uid,
    )
  }

  async revokeAll() {
    const key = getRedisKey(RedisKeys.JWTStore)
    await this.redis.del(key)
  }

  async verifyToken(token: string) {
    const jwt = token.replace(/[Bb]earer /, '')

    if (!isJWT(jwt))
      throw new BizException(ErrorEnum.JWTInvalid)

    try {
      const result = this.jwtService.verify(token)
      if (!result)
        return false

      return await this.isTokenInRedis(token)
    }
    catch (error) {
      return false
    }
  }
}

function isJWT(token: string): boolean {
  const parts = token.split('.')
  return (
    parts.length === 3
    && /^[a-zA-Z0-9_-]+$/.test(parts[0])
    && /^[a-zA-Z0-9_-]+$/.test(parts[1])
    && /^[a-zA-Z0-9_-]+$/.test(parts[2])
  )
}
