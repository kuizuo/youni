import { Module, Provider } from '@nestjs/common'

import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { ISecurityConfig } from '~/config'
import { isDev } from '~/global/env'

import { UserModule } from '../user/user.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { CaptchaModule } from './captcha/captcha.module'
import { AccountController } from './controllers/account.controller'
import { EmailController } from './controllers/email.controller'
import { GoogleController } from './controllers/google.controller'
import { TokenService } from './services/token.service'
import { GoogleStrategy } from './strategies/google.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'

const controllers = [
  AuthController,
  AccountController,
  EmailController,
  GoogleController,
]
const providers: Provider[] = [AuthService, TokenService]
const strategies = [LocalStrategy, JwtStrategy, GoogleStrategy]

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const { jwtSecret, jwtExprire }
          = configService.get<ISecurityConfig>('security')!

        return {
          secret: jwtSecret,
          expires: jwtExprire,
          ignoreExpiration: isDev,
        }
      },
      inject: [ConfigService],
    }),
    CaptchaModule,
    UserModule,
  ],
  controllers: [...controllers],
  providers: [...providers, ...strategies],
  exports: [JwtModule, ...providers],
})
export class AuthModule {}
