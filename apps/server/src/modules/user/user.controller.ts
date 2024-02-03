import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { ApiSecurityAuth } from '@server/common/decorators/swagger.decorator'
import { IdDto } from '@server/common/dto/id.dto'

import { Action } from '../casl/ability.class'
import { Policy } from '../casl/policy.decortor'
import { PolicyGuard } from '../casl/policy.guard'

import { UserPasswordDto } from './dto/password.dto'
import { UserDto, UserQueryDto, UserUpdateDto } from './dto/user.dto'
import { UserService } from './user.service'

@ApiTags('System - 用户模块')
@ApiSecurityAuth()
@UseGuards(PolicyGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @Policy({ action: Action.Read, model: 'User' })
  async list(@Query() dto: UserQueryDto) {
    return this.userService.paginate(dto)
  }

  @Get(':id')
  @ApiOperation({ summary: '查询用户' })
  async getUserById(@Param() { id }: IdDto) {
    return this.userService.getUserById(id)
  }

  @Post()
  @ApiOperation({ summary: '新增用户' })
  async create(@Body() dto: UserDto) {
    await this.userService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  async update(@Param() { id }: IdDto, @Body() dto: UserUpdateDto) {
    await this.userService.update(id, dto)
    // await this.menuService.refreshPerms(id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  async delete(@Param() { id }: IdDto) {
    await this.userService.delete([id])
  }

  @Post(':id/password')
  @ApiOperation({ summary: '更改用户密码' })
  async password(@Body() dto: UserPasswordDto) {
    await this.userService.forceUpdatePassword(dto.id, dto.password)
  }
}
