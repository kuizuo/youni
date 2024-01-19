import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiSecurityAuth } from '~/common/decorators/swagger.decorator'

import { IdDto } from '~/common/dto/id.dto'
import {
  Perm,
  PermissionValue,
} from '~/modules/auth/decorators/permission.decorator'

import { MenuService } from '../menu/menu.service'

import { RoleDto, RoleUpdateDto } from './role.dto'
import { RoleService } from './role.service'

export const permissions = {
  LIST: 'role:list',
  CREATE: 'role:create',
  READ: 'role:read',
  UPDATE: 'role:update',
  DELETE: 'role:delete',
} satisfies Record<string, PermissionValue<'role'>>

@ApiTags('System - 角色模块')
@ApiSecurityAuth()
@Controller('roles')
export class RoleController {
  constructor(
    private roleService: RoleService,
    private menuService: MenuService,
  ) {}

  @Get()
  @Perm(permissions.LIST)
  async list() {
    return this.roleService.list()
  }

  @Get(':id')
  @Perm(permissions.READ)
  async getRoleById(@Param() { id }: IdDto) {
    return this.roleService.getRoleById(id)
  }

  @Post()
  @Perm(permissions.CREATE)
  async create(@Body() dto: RoleDto) {
    await this.roleService.create(dto)
  }

  @Put(':id')
  @Perm(permissions.UPDATE)
  async update(@Param() { id }: IdDto, @Body() dto: RoleUpdateDto) {
    await this.roleService.update(id, dto)
    await this.menuService.refreshOnlineUserPerms()
  }

  @Delete(':id')
  @Perm(permissions.DELETE)
  async delete(@Param() { id }: IdDto) {
    if (await this.roleService.checkUserByRoleId(id))
      throw new BadRequestException('该角色存在关联用户，无法删除')

    await this.roleService.delete(id)
    await this.menuService.refreshOnlineUserPerms()
  }
}
