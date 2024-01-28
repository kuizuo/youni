import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'

import Redis from 'ioredis'
import { isEmpty } from 'lodash'

import { BizException } from '~/common/exceptions/biz.exception'
import { RedisKeys } from '~/constants/cache.constant'
import { ErrorEnum } from '~/constants/error-code.constant'
import { getRedisKey } from '~/utils/redis.util'

@Injectable()
export class CaptchaService {
  constructor(
    @InjectRedis() private readonly redis: Redis,

    // private captchaLogService: CaptchaLogService,
  ) {}

  /**
   * 校验图片验证码
   */
  async checkImgCaptcha(id: string, code: string): Promise<void> {
    const key = getRedisKey(RedisKeys.CaptchaStore, id)
    const result = await this.redis.get(key)
    if (isEmpty(result) || code.toLowerCase() !== result?.toLowerCase())
      throw new BizException(ErrorEnum.INVALID_VERIFICATION_CODE)

    // 校验成功后移除验证码
    await this.redis.del(key)
  }

  async log(
    account: string,
    code: string,
    provider: 'sms' | 'email',
    uid?: number,
  ): Promise<void> {
    // await this.captchaLogService.create(account, code, provider, uid)
  }
}
