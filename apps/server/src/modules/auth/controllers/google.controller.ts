import {
  Controller,
  Get,
  Inject,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'

import { AppConfig, IAppConfig } from '@server/config'
import { FastifyReply, FastifyRequest } from 'fastify'

import { AuthStrategy } from '../auth.constant'
import { AuthService } from '../auth.service'
import { Public } from '../decorators/public.decorator'
import { TokenService } from '../services/token.service'

@ApiTags('Auth - 认证模块')
@Controller('auth/google')
@Public()
export class GoogleController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    @Inject(AppConfig.KEY) private readonly appConfig: IAppConfig,
  ) {}

  @Get()
  @UseGuards(AuthGuard(AuthStrategy.GOOGLE))
  async googleAuth(@Req() _req: FastifyRequest) {}

  @Get('callback')
  @UseGuards(AuthGuard(AuthStrategy.GOOGLE))
  async googleAuthRedirect(
    @Req() req: FastifyRequest, @Res()
res: FastifyReply,
  ) {
    // FIXME:
    // const user = await this.authService.loginByGoogle(
    //   req.user as unknown as Prisma.UserCreateInput,
    // )

    // const token = await this.tokenService.generateToken(user.id)

    // res.setCookie('token', token).send(
    //   new ResOp({
    //     data: {
    //       token,
    //     },
    //   }),
    // )
  }
}
