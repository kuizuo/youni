import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { IdParam } from '~/common/decorators/id-param.decorator'
import { ApiSecurityAuth } from '~/common/decorators/swagger.decorator'

import { Perm, PermissionMap } from '~/modules/auth/decorators/permission.decorator'

import { MenuService } from '../menu/menu.service'

import { RoleDto, RoleUpdateDto } from './role.dto'
import { RoleService } from './role.service'

export const permissions: PermissionMap<'role'> = {
  LIST: 'role:list',
  CREATE: 'role:create',
  READ: 'role:read',
  UPDATE: 'role:update',
  DELETE: 'role:delete',
} as const

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
  async getRoleById(@IdParam() id: number) {
    return this.roleService.getRoleById(id)
  }

  @Post()
  @Perm(permissions.CREATE)
  async create(@Body() dto: RoleDto) {
    await this.roleService.create(dto)
  }

  @Put(':id')
  @Perm(permissions.UPDATE)
  async update(
    @IdParam() id: number,
    @Body() dto: RoleUpdateDto,
  ) {
    await this.roleService.update(id, dto)
    // await this.menuService.refreshOnlineUserPerms()
  }

  @Delete(':id')
  @Perm(permissions.DELETE)
  async delete(@IdParam() id: number) {
    if (await this.roleService.checkUserByRoleId(id))
      throw new BadRequestException('该角色存在关联用户，无法删除')

    await this.roleService.delete(id)
    // await this.menuService.refreshOnlineUserPerms()
  }
}
