import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { Ip } from '@server/common/decorators/http.decorator'
import { ProtectKeys } from '@server/common/decorators/protect-keys.decorator'

import { UserService } from '../user/user.service'

import { LoginDto, RegisterDto } from './auth.dto'
import { LoginResult } from './auth.model'
import { AuthService } from './auth.service'
import { Public } from './decorators/public.decorator'
import { LocalGuard } from './guards/local.guard'

@ApiTags('Auth - 认证模块')
@UseGuards(LocalGuard)
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) { }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Ip()
      ip: string, @Headers('user-agent')
      ua: string,
  ): Promise<LoginResult> {
    const { username, password, type } = dto
    // await this.captchaService.checkImgCaptcha(captchaId, verifyCode);

    const user = await this.authService.validateUser(username, password, type)

    const jwt = await this.authService.sign(user.id, user.role, { ip, ua })
    return { authToken: jwt }
  }

  @Post('register')
  @ProtectKeys(['password'])
  async register(@Body() dto: RegisterDto) {
    return await this.userService.register(dto)
  }
}
