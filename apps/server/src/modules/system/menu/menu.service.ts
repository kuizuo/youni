import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'

import { concat, isEmpty, uniq } from 'lodash'

import { BusinessException } from '~/common/exceptions/biz.exception'
import { ErrorEnum } from '~/constants/error-code.constant'
import { ExtendedPrismaClient } from '~/shared/database/prisma.extension'

import { RoleService } from '../role/role.service'

import { MenuDto, MenuQueryDto, MenuUpdateDto } from './menu.dto'

@Injectable()
export class MenuService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @Inject('PRISMA_CLIENT')
    private readonly prisma: ExtendedPrismaClient,
    private roleService: RoleService,
  ) {}

  async list({
    name,
    path,
    permission,
    component,
    status,
  }: MenuQueryDto) {
    const menus = await this.prisma.menu.findMany({
      where: {
        ...(name && { name: { contains: name } }),
        ...(path && { path: { contains: path } }),
        ...(permission && { permission: { contains: permission } }),
        ...(component && { component: { contains: component } }),
        ...(status && { status }),
      },
      orderBy: { order: 'asc' },
    })

    return menus
  }

  async create(menu: MenuDto): Promise<void> {
    await this.prisma.menu.create({
      data: {
        ...menu,
      },
    })
  }

  async update(id: number, menu: MenuUpdateDto): Promise<void> {
    await this.prisma.menu.update({
      where: { id },
      data: {
        ...menu,
      },
    })
  }

  async getMenus(uid: string) {
    const roles = await this.roleService.getRolesByUserId(uid)

    if (this.roleService.hasAdminRole(roles.map(r => r.id))) {
      return await this.prisma.menu.findMany({ orderBy: { order: 'asc' } })
    }
    else {
      return await this.prisma.menu.findMany({
        where: { id: { in: roles.map(r => r.id) } },
        orderBy: { order: 'asc' },
      })
    }

    // const routers = generatorRouters(menus)
    // return routers
  }

  /**
   * 检查菜单创建规则是否符合
   */
  async check(dto: Partial<MenuDto>) {
    if (dto.type === 2 && !dto.parent) {
      // 无法直接创建权限，必须有parent
      throw new BusinessException(ErrorEnum.PERMISSION_REQUIRES_PARENT)
    }
    if (dto.type === 1 && dto.parent) {
      const parent = await this.getMenuItemInfo(dto.parent)
      if (isEmpty(parent))
        throw new BusinessException(ErrorEnum.PARENT_MENU_NOT_FOUND)

      if (parent && parent.type === 1) {
        // 当前新增为菜单但父节点也为菜单时为非法操作
        throw new BusinessException(
          ErrorEnum.ILLEGAL_OPERATION_DIRECTORY_PARENT,
        )
      }
    }
  }

  /**
   * 查找当前菜单下的子菜单，目录以及菜单
   */
  async findChildMenus(mid: number) {
    const allMenus: any = []
    const menus = await this.prisma.menu.findMany({ where: { parent: mid } })
    // if (_.isEmpty(menus)) {
    //   return allMenus;
    // }
    // const childMenus: any = [];
    for (const menu of menus) {
      if (menu.type !== 2) {
        // 子目录下是菜单或目录，继续往下级查找
        const c = await this.findChildMenus(menu.id)
        allMenus.push(c)
      }
      allMenus.push(menu.id)
    }
    return allMenus
  }

  /**
   * 获取某个菜单的信息
   * @param mid menu id
   */
  async getMenuItemInfo(mid: number) {
    const menu = await this.prisma.menu.findUnique({ where: { id: mid } })
    return menu
  }

  /**
   * 获取某个菜单以及关联的父菜单的信息
   */
  async getMenuItemAndParentInfo(mid: number) {
    const menu = await this.prisma.menu.findUnique({ where: { id: mid } })
    let parentMenu
    if (menu && menu.parent)
      parentMenu = await this.prisma.menu.findUnique({ where: { id: menu.parent } })

    return { menu, parentMenu }
  }

  /**
   * 查找节点路由是否存在
   */
  async findRouterExist(path: string): Promise<boolean> {
    const menus = await this.prisma.menu.findFirst({ where: { path } })
    return !isEmpty(menus)
  }

  /**
   * 获取当前用户的所有权限
   */
  async getPermissions(uid: string): Promise<string[]> {
    const roles = await this.roleService.getRolesByUserId(uid)
    let permission: any[] = []
    let result: any = null
    if (this.roleService.hasAdminRole(roles.map(r => r.id))) {
      result = await this.prisma.menu.findMany({
        where: {
          permission: { not: null },
          type: { in: [1, 2] },
        },
      })
    }
    else {
      if (isEmpty(roles))
        return permission

      result = await this.prisma.menu.findMany({
        where: {
          permission: { not: null },
          type: { in: [1, 2] },
        },
        include: {
          roles: {
            where: {
              id: {
                in: roles.map(r => r.id),
              },
            },
          },
        },
      },
      )
    }
    if (!isEmpty(result)) {
      result.forEach((e) => {
        if (e.permission)
          permission = concat(permission, e.permission.split(','))
      })
      permission = uniq(permission)
    }
    return permission
  }

  /**
   * 删除多项菜单
   */
  async deleteMenuItem(mids: number[]): Promise<void> {
    await this.prisma.menu.deleteMany({ where: { id: { in: mids } } })
  }

  /**
   * 刷新指定用户ID的权限
   */
  async refreshPerms(uid: string): Promise<void> {
    const perms = await this.getPermissions(uid)
    const online = await this.redis.get(`admin:token:${uid}`)
    if (online) {
      // 判断是否在线
      await this.redis.set(`admin:perms:${uid}`, JSON.stringify(perms))
    }
  }

  /**
   * 刷新所有在线用户的权限
   */
  async refreshOnlineUserPerms(): Promise<void> {
    const onlineUserIds: string[] = await this.redis.keys('admin:token:*')
    if (onlineUserIds && onlineUserIds.length > 0) {
      onlineUserIds
        .map(i => i.split('admin:token:')[1])
        .filter(i => i)
        .forEach(async (uid) => {
          const perms = await this.getPermissions(uid)
          await this.redis.set(`admin:perms:${uid}`, JSON.stringify(perms))
        })
    }
  }

  /**
   * 根据菜单ID查找是否有关联角色
   */
  async checkRoleByMenuId(id: number): Promise<boolean> {
    return !!(await this.prisma.menu.exists({
      where: {
        roles: {
          some: {
            id,
          },
        },
      },
    }))
  }
}
