import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'

import { Ip } from '~/common/decorators/http.decorator'
import { MailerService } from '~/shared/helper/mailer/mailer.service'

import { Public } from '../decorators/public.decorator'
import { SendEmailCodeDto } from '../captcha/captcha.dto'

@ApiTags('Auth - 认证模块')
@UseGuards(ThrottlerGuard)
@Controller('auth/email')
export class EmailController {
  constructor(
    private mailerService: MailerService,
  ) {}

  @Post('send')
  @Public()
  @Throttle({ default: { limit: 2, ttl: 60 * 1000 } })
  async sendEmailCode(
    @Body() dto: SendEmailCodeDto,
    @Ip() ip: string,
  ): Promise<void> {
    const { email } = dto

    await this.mailerService.checkLimit(email, ip)
    const { code } = await this.mailerService.sendVerificationCode(email)

    await this.mailerService.log(email, code, ip)
  }
}
