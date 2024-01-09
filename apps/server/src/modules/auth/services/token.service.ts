import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import dayjs from 'dayjs'

import { ISecurityConfig, SecurityConfig } from '~/config'

import { RoleService } from '~/modules/system/role/role.service'
import { ExtendedPrismaClient } from '~/shared/database/prisma.extension'
import { generateUUID } from '~/utils/tool.util'

/**
 * 令牌服务
 */
@Injectable()
export class TokenService {
  constructor(
    @Inject(SecurityConfig.KEY)
    private readonly securityConfig: ISecurityConfig,
    @Inject('PRISMA_CLIENT')
    private readonly prisma: ExtendedPrismaClient,
    private readonly jwtService: JwtService,
    private readonly roleService: RoleService,
  ) {}

  async refreshToken(accessTokenId: string) {
    // FIXME:
    const { user, refreshToken } = accessTokenId as any

    if (refreshToken) {
      const now = dayjs()
      // 判断refreshToken是否过期
      if (now.isAfter(refreshToken.expired_at))
        return null

      const roles = await this.roleService.getRolesByUserId(user.id)

      // 如果没过期则生成新的access_token和refresh_token
      const token = await this.generateAccessToken(user.id, roles.map(item => item.value))

      this.prisma.token.delete({ where: { id: accessTokenId } })
      return token
    }
    return null
  }

  generateJwtSign(payload: any) {
    const jwtSign = this.jwtService.sign(payload)

    return jwtSign
  }

  async generateAccessToken(uid: string, roles: string[] = []) {
    const payload: IAuthUser = {
      uid,
      pv: 1,
      roles,
    }

    const jwtSign = this.jwtService.sign(payload)

    const accessToken = await this.prisma.token.create({
      data: {
        id: generateUUID(),
        value: jwtSign,
        userId: uid,
        expiredAt: dayjs()
          .add(this.securityConfig.jwtExprire, 'second')
          .toDate(),
        // refreshToken:
      },
    })

    const refreshTokenPayload = {
      uuid: generateUUID(),
    }

    const refreshTokenSign = this.jwtService.sign(refreshTokenPayload, {
      secret: this.securityConfig.refreshSecret,
    })

    const refreshToken = await this.prisma.freshToken.create({
      data: {
        id: refreshTokenPayload.uuid,
        value: refreshTokenSign,
        expiredAt: dayjs()
          .add(this.securityConfig.refreshExpire, 'second')
          .toDate(),
        tokenId: accessToken.id,
      },
    })

    return {
      accessToken: jwtSign,
      refreshToken: refreshTokenSign,
    }
  }

  async checkAccessToken(value: string) {
    return this.prisma.token.findFirst({
      where: { value },
      include: {
        user: true,
        refreshToken: true,
      },
    })
  }

  async removeAccessToken(value: string) {
    const accessToken = await this.prisma.token.findFirst({
      where: { value },
    })
    await this.prisma.token.delete({ where: { id: accessToken?.id } })
  }

  async removeRefreshToken(value: string) {
    const freshToken = await this.prisma.freshToken.findFirst({
      where: { value },
    })
    await this.prisma.freshToken.delete({ where: { id: freshToken?.id } })
  }

  async verifyAccessToken(token: string) {
    const result = this.jwtService.verify(token)
    if (!result)
      return false

    return true
  }
}
