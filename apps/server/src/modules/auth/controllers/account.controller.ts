import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiSecurityAuth } from '~/common/decorators/swagger.decorator'
import { AllowAnon } from '~/modules/auth/decorators/allow-anon.decorator'
import { AuthUser } from '~/modules/auth/decorators/auth-user.decorator'
import { PasswordUpdateDto } from '~/modules/user/dto/password.dto'

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
    return this.userService.getProfile(user.uid)
  }

  @Put('profile')
  @AllowAnon()
  async updateProfile(
    @AuthUser() user: IAuthUser, @Body() dto: UpdateProfileDto): Promise<void> {
    await this.userService.updateProfile(user.uid, dto)
  }

  @Get('logout')
  @AllowAnon()
  async logout(@AuthUser() user: IAuthUser): Promise<void> {
    await this.authService.clearLoginStatus(user.uid)
  }

  @Get('menus')
  @AllowAnon()
  async menu(@AuthUser() user: IAuthUser) {
    return this.authService.getMenus(user.uid)
  }

  @Get('permissions')
  @AllowAnon()
  async permissions(@AuthUser() user: IAuthUser) {
    return this.authService.getPermissions(user.uid)
  }

  @Put('password')
  @AllowAnon()
  async password(
    @AuthUser() user: IAuthUser, @Body() dto: PasswordUpdateDto): Promise<void> {
    await this.userService.updatePassword(user.uid, dto)
  }
}
