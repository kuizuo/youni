import { Module, Provider } from '@nestjs/common'

import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { ISecurityConfig } from '~/config'
import { isDev } from '~/global/env'

// import { LogModule } from '../system/log/log.module'
import { MenuModule } from '../system/menu/menu.module'
import { RoleModule } from '../system/role/role.module'
import { UserModule } from '../user/user.module'

import { AuthService } from './auth.service'
import { AccountController } from './controllers/account.controller'
import { AuthController } from './controllers/auth.controller'
import { CaptchaController } from './controllers/captcha.controller'
import { EmailController } from './controllers/email.controller'
import { GoogleController } from './controllers/google.controller'
import { CaptchaService } from './services/captcha.service'
import { TokenService } from './services/token.service'
import { GoogleStrategy } from './strategies/google.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'

const controllers = [
  AuthController,
  AccountController,
  CaptchaController,
  EmailController,
  GoogleController,
]
const providers: Provider[] = [AuthService, TokenService, CaptchaService]
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
    UserModule,
    RoleModule,
    MenuModule,
    // LogModule,
  ],
  controllers: [...controllers],
  providers: [...providers, ...strategies],
  exports: [JwtModule, ...providers],
})
export class AuthModule {}
