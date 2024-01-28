import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'
import { compareSync } from 'bcrypt'

import Redis from 'ioredis'

import { BizException } from '~/common/exceptions/biz.exception'
import { ErrorEnum } from '~/constants/error-code.constant'
import { UserService } from '~/modules/user/user.service'

import { sleep } from '~/utils/tool.util'

import { LoginType, Role } from './auth.constant'
import { TokenService } from './services/token.service'

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(credential: string, password: string, type: LoginType) {
    const user = type === 'account'
      ? await this.userService.findUserByUsername(credential)
      : type === 'email'
        ? await this.userService.findUserByEmail(credential)
        : null

    if (!user)
      throw new BizException(ErrorEnum.USER_NOT_FOUND)

    const isSamePassword = compareSync(password, user.password)

    if (!isSamePassword) {
      await sleep(1500)
      throw new BizException(ErrorEnum.INVALID_USERNAME_PASSWORD)
    }

    const { password: _p, ...result } = user
    return result
  }

  async validateToken(token: string) {
    return await this.tokenService.verifyToken(token)
  }

  async sign(
    userId: string,
    role: Role,
    otherInfo?: {
      ip: string
      ua: string
    },
  ): Promise<string> {
    const token = await this.tokenService.generateToken({ uid: userId, role }, otherInfo)

    return token
  }

  async clearLoginStatus(uid: string): Promise<void> {
    await this.tokenService.removeToken(uid)
  }
}
