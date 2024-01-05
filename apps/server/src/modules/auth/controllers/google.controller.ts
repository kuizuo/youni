import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'

import { FastifyReply, FastifyRequest } from 'fastify'

import { ResOp } from '~/common/model/response.model'
import { AppConfig, IAppConfig } from '~/config'

import { AuthStrategy } from '../auth.constant'
import { AuthService } from '../auth.service'
import { Public } from '../decorators/public.decorator'
import { TokenService } from '../services/token.service'

@ApiTags('Auth - 认证模块')
@Controller('auth/google')
@Public()
export class GoogleController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    @Inject(AppConfig.KEY) private readonly appConfig: IAppConfig,
  ) {}

  @Get()
  @UseGuards(AuthGuard(AuthStrategy.GOOGLE))
  async googleAuth(@Req() _req: FastifyRequest) {}

  @Get('callback')
  @UseGuards(AuthGuard(AuthStrategy.GOOGLE))
  async googleAuthRedirect(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const user = await this.authService.loginByGoogle(
      req.user,
    )

    const { accessToken } = await this.tokenService.generateAccessToken(user.id)

    res.setCookie('token', accessToken).send(
      new ResOp(HttpStatus.OK, {
        token: accessToken,
      }),
    )
  }
}
