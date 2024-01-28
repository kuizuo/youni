import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { ApiSecurityAuth } from '~/common/decorators/swagger.decorator'
import { IdDto } from '~/common/dto/id.dto'
import { Perm, PermissionValue } from '~/modules/auth/decorators/permission.decorator'

import { UserPasswordDto } from './dto/password.dto'
import { UserDto, UserQueryDto, UserUpdateDto } from './dto/user.dto'
import { UserService } from './user.service'

export const permissions = {
  LIST: 'user:list',
  CREATE: 'user:create',
  READ: 'user:read',
  UPDATE: 'user:update',
  DELETE: 'user:delete',

  PASSWORD_UPDATE: 'user:password:update',
  PASSWORD_RESET: 'user:password:reset',
} satisfies Record<string, PermissionValue<'user'>>

@ApiTags('System - 用户模块')
@ApiSecurityAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
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
  async getUserById(@Param() { id }: IdDto) {
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
  async update(@Param() { id }: IdDto, @Body() dto: UserUpdateDto) {
    await this.userService.update(id, dto)
    // await this.menuService.refreshPerms(id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @Perm(permissions.DELETE)
  async delete(@Param() { id }: IdDto) {
    await this.userService.delete([id])
  }

  @Post(':id/password')
  @ApiOperation({ summary: '更改用户密码' })
  @Perm(permissions.PASSWORD_UPDATE)
  async password(@Body() dto: UserPasswordDto) {
    await this.userService.forceUpdatePassword(dto.id, dto.password)
  }
}
