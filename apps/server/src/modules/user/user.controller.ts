import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { IdParam } from '~/common/decorators/id-param.decorator'
import { ApiSecurityAuth } from '~/common/decorators/swagger.decorator'
import { Perm, PermissionMap } from '~/modules/auth/decorators/permission.decorator'
import { MenuService } from '~/modules/system/menu/menu.service'

import { UserPasswordDto } from './dto/password.dto'
import { UserDto, UserQueryDto, UserUpdateDto } from './dto/user.dto'
import { UserService } from './user.service'

export const permissions: PermissionMap<'user'> = {
  LIST: 'user:list',
  CREATE: 'user:create',
  READ: 'user:read',
  UPDATE: 'user:update',
  DELETE: 'user:delete',

  PASSWORD_UPDATE: 'user:password:update',
  PASSWORD_RESET: 'user:pass:reset',
} as const

@ApiTags('System - 用户模块')
@ApiSecurityAuth()
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private menuService: MenuService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @Perm(permissions.LIST)
  async list(@Query() dto: UserQueryDto) {
    return this.userService.paginate(dto)
  }

  @Get(':id')
  @ApiOperation({ summary: '查询用户' })
  @Perm(permissions.READ)
  async getUserById(@IdParam() id: string) {
    return this.userService.getUserById(id)
  }

  @Post()
  @ApiOperation({ summary: '新增用户' })
  @Perm(permissions.CREATE)
  async create(@Body() dto: UserDto) {
    await this.userService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  @Perm(permissions.UPDATE)
  async update(@IdParam() id: string, @Body() dto: UserUpdateDto) {
    await this.userService.update(id, dto)
    // await this.menuService.refreshPerms(id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @Perm(permissions.DELETE)
  async delete(@IdParam() id: string) {
    await this.userService.delete([id])
    await this.userService.multiForbidden([id])
  }

  @Post(':id/password')
  @ApiOperation({ summary: '更改用户密码' })
  @Perm(permissions.PASSWORD_UPDATE)
  async password(@Body() dto: UserPasswordDto) {
    await this.userService.forceUpdatePassword(dto.id, dto.password)
  }
}
