import { Body, Controller, Headers, Post, Res, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { Ip } from '@server/common/decorators/http.decorator'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ResOp } from '@server/common/model/response.model'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { FastifyReply } from 'fastify'

import { UserService } from '../user/user.service'

import { LoginDto } from './auth.dto'
import { AuthService } from './auth.service'
import { Public } from './decorators/public.decorator'
import { LocalGuard } from './guards/local.guard'

@ApiTags('Auth - 认证模块')
@UseGuards(LocalGuard)
@Public()
@Controller('auth/admin')
export class AuthAdminController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) { }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res() res: FastifyReply,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) {
    const { username, password, type } = dto

    // await this.captchaService.checkImgCaptcha(captchaId, verifyCode);

    const user = await this.authService.validateUser(username, password, type)

    if (user.role !== 'Admin')
      throw new BizException(ErrorCodeEnum.PasswordMismatch)

    const jwt = await this.authService.sign(user.id, user.role, { ip, ua })

    res.setCookie('auth-token', jwt)
    res.send(
      new ResOp({
        data: { authToken: jwt },
      }),
    )
  }

  // @Post('register')
  // @ProtectKeys(['password'])
  // async register(@Body() dto: RegisterDto) {
  //   return await this.userService.register(dto)
  // }
}
