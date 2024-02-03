import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiSecurityAuth } from '@server/common/decorators/swagger.decorator'
import { AllowAnon } from '@server/modules/auth/decorators/allow-anon.decorator'
import { AuthUser } from '@server/modules/auth/decorators/auth-user.decorator'
import { PasswordUpdateDto } from '@server/modules/user/dto/password.dto'

import { UserService } from '../../user/user.service'
import { AuthService } from '../auth.service'
import { UpdateProfileDto } from '../dtos/account.dto'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

@ApiTags('Account - 账户模块')
@ApiSecurityAuth()
@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('profile')
  @AllowAnon()
  async profile(@AuthUser() user: IAuthUser) {
    return this.userService.getProfile(user.id)
  }

  @Put('profile')
  @AllowAnon()
  async updateProfile(
    @AuthUser() user: IAuthUser, @Body()
dto: UpdateProfileDto,
  ): Promise<void> {
    await this.userService.updateProfile(user.id, dto)
  }

  @Get('logout')
  @AllowAnon()
  async logout(@AuthUser() user: IAuthUser): Promise<void> {
    await this.authService.clearLoginStatus(user.id)
  }

  @Put('password')
  @AllowAnon()
  async password(
    @AuthUser() user: IAuthUser, @Body()
dto: PasswordUpdateDto,
  ): Promise<void> {
    await this.userService.updatePassword(user.id, dto)
  }

  // @Get('menus')
  // @AllowAnon()
  // async menu(@AuthUser() user: IAuthUser) {
  //   return this.authService.getMenus(user.id)
  // }

  // @Get('permissions')
  // @AllowAnon()
  // async permissions(@AuthUser() user: IAuthUser) {
  //   return this.authService.getPermissions(user.id)
  // }
}
