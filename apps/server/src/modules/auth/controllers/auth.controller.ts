import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { Ip } from '~/common/decorators/http.decorator'
import { ProtectKeys } from '~/common/decorators/protect-keys.decorator'

import { UserService } from '../../user/user.service'
import { AuthService } from '../auth.service'
import { Public } from '../decorators/public.decorator'
import { PasswordLoginDto, RegisterDto } from '../dtos/auth.dto'
import { LocalGuard } from '../guards/local.guard'
import { LoginToken } from '../models/auth.model'

@ApiTags('Auth - 认证模块')
@UseGuards(LocalGuard)
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('login')
  async login(
    @Body() dto: PasswordLoginDto,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ): Promise<LoginToken> {
    const { username, password } = dto
    // await this.captchaService.checkImgCaptcha(captchaId, verifyCode);

    const user = await this.authService.validateUser(username, password)

    const jwt = await this.authService.sign(
      user.id,
      ip,
      ua,
    )
    return { authToken: jwt }
  }

  @Post('register')
  @ProtectKeys(['passowrd'])
  async register(@Body() dto: RegisterDto) {
    return await this.userService.register(dto)
  }
}
