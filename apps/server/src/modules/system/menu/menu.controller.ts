import {
  Controller,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiSecurityAuth } from '~/common/decorators/swagger.decorator'

import { PermissionValue } from '~/modules/auth/decorators/permission.decorator'

import { MenuService } from './menu.service'

export const permissions = {
  LIST: 'menu:list',
  CREATE: 'menu:create',
  READ: 'menu:read',
  UPDATE: 'menu:update',
  DELETE: 'menu:delete',
} satisfies Record<string, PermissionValue<'menu'>>

@ApiTags('System - 菜单权限模块')
@ApiSecurityAuth()
@Controller('menus')
export class MenuController {
  constructor(private menuService: MenuService) {}

  // @Get()
  // @ApiOperation({ summary: '获取所有菜单列表' })
  // @Perm(permissions.LIST)
  // async list(@Query() dto: MenuQueryDto) {
  //   return this.menuService.list(dto)
  // }

  // @Get(':id')
  // @ApiOperation({ summary: '获取菜单或权限信息' })
  // @Perm(permissions.READ)
  // async info(@Param() { id }: IdDto) {
  //   return this.menuService.getMenuItemAndParentInfo(id)
  // }

  // @Post()
  // @ApiOperation({ summary: '新增菜单或权限' })
  // @Perm(permissions.CREATE)
  // async create(@Body() dto: MenuDto): Promise<void> {
  //   // check
  //   await this.menuService.check(dto)
  //   if (!dto.parent)
  //     dto.parent = null

  //   if (dto.type === 0)
  //     dto.component = 'LAYOUT'

  //   await this.menuService.create(dto)
  //   if (dto.type === 2) {
  //     // 如果是权限发生更改，则刷新所有在线用户的权限
  //     await this.menuService.refreshOnlineUserPerms()
  //   }
  // }

  // @Put(':id')
  // @ApiOperation({ summary: '更新菜单或权限' })
  // @Perm(permissions.UPDATE)
  // async update(
  //   @Param() { id }: IdDto,
  //   @Body() dto: MenuUpdateDto,
  // ): Promise<void> {
  //   // check
  //   await this.menuService.check(dto)
  //   if (dto.parent === -1 || !dto.parent)
  //     dto.parent = null

  //   await this.menuService.update(id, dto)
  //   if (dto.type === 2) {
  //     // 如果是权限发生更改，则刷新所有在线用户的权限
  //     await this.menuService.refreshOnlineUserPerms()
  //   }
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: '删除菜单或权限' })
  // @Perm(permissions.DELETE)
  // async delete(@Param() { id }: IdDto): Promise<void> {
  //   if (await this.menuService.checkRoleByMenuId(id))
  //     throw new BadRequestException('该菜单存在关联角色，无法删除')

  //   // 如果有子目录，一并删除
  //   const childMenus = await this.menuService.findChildMenus(id)
  //   await this.menuService.deleteMenuItem(flattenDeep([id, childMenus]))
  //   // 刷新在线用户权限
  //   await this.menuService.refreshOnlineUserPerms()
  // }
}
