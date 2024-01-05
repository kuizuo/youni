import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { Throttle, ThrottlerGuard } from '@nestjs/throttler'

import { Ip } from '~/common/decorators/http.decorator'

import { UserService } from '~/modules/user/user.service'
import { MailerService } from '~/shared/mailer/mailer.service'

import { AuthService } from '../auth.service'
import { Public } from '../decorators/public.decorator'

import { RegisterDto } from '../dto/auth.dto'
import { SendEmailCodeDto } from '../dto/captcha.dto'
import { EmailLoginDto, EmailRegisterDto } from '../dto/email.dto'
import { LoginToken } from '../models/auth.model'
import { CaptchaService } from '../services/captcha.service'
import { TokenService } from '../services/token.service'

@ApiTags('Auth - 认证模块')
@UseGuards(ThrottlerGuard)
@Controller('auth/email')
export class EmailController {
  constructor(
    private mailerService: MailerService,
    private userService: UserService,
    private tokenService: TokenService,
    private authService: AuthService,
    private captchaService: CaptchaService,
  ) {}

  @Post('send')
  @ApiOperation({ summary: '发送邮箱验证码' })
  @Public()
  @Throttle({ default: { limit: 2, ttl: 600000 } })
  async sendEmailCode(
    @Body() dto: SendEmailCodeDto,
    @Ip() ip: string,
  ): Promise<void> {
    // FIXME: test
    // await this.captchaService.checkImgCaptcha(dto.captchaId, dto.verifyCode)
    const { email } = dto

    // FIXME: test
    // await this.mailerService.checkLimit(email, ip)
    const { code } = await this.mailerService.sendVerificationCode(email)

    await this.mailerService.log(email, code, ip)
  }

  @Post('login')
  @ApiOperation({ summary: '邮箱登录' })
  @Public()
  async login(
    @Body() dto: EmailLoginDto,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ): Promise<LoginToken> {
    await this.mailerService.checkCode(dto.email, dto.code)

    const user = await this.userService.findUserByUsername(dto.email)

    const token = await this.tokenService.generateAccessToken(user.id)

    await this.authService.loginLog(user.id, ip, ua)

    return { token: token.accessToken }
  }

  @Post('register')
  @ApiOperation({ summary: '邮箱注册' })
  @Public()
  async email_register(
    @Body() dto: EmailRegisterDto,
  ) {
    await this.mailerService.checkCode(dto.email, dto.code)

    const param: RegisterDto = {
      username: dto.email,
      password: dto.password,
    }

    await this.userService.register(param)
  }
}
