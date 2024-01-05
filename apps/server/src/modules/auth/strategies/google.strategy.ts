import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { User } from '@youni/prisma'
import { Strategy } from 'passport-google-oauth20'

import { AppConfig, GoogleConfig, IAppConfig, IGoogleConfig } from '~/config'

import { AuthStrategy } from '../auth.constant'

export interface GoogleProfile {
  sub: string
  name: string
  given_name: string
  picture: string
  email: string
  email_verified: boolean
  locale: string
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  AuthStrategy.GOOGLE,
) {
  constructor(
    @Inject(GoogleConfig.KEY) private readonly googleConfig: IGoogleConfig,
    @Inject(AppConfig.KEY) private readonly appConfig: IAppConfig,
  ) {
    super({
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.secret,
      callbackURL: `${appConfig.baseUrl}/${appConfig.globalPrefix}/auth/google/callback`,
      scope: ['email', 'profile'],
      proxy: true,
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: { _json: GoogleProfile },
  ): Promise<any> {
    const { name, picture, email, locale } = profile._json

    const user: Partial<User> & {
      accessToken: string
      refreshToken: string
    } = {
      email,
      username: email,
      nickname: name,
      avatar: picture,
      accessToken,
      refreshToken,
    }
    return user
  }
}
