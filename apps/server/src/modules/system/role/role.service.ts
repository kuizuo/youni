import { Inject, Injectable } from '@nestjs/common'

import { ExtendedPrismaClient } from '~/shared/database/prisma.extension'

import { RoleDto, RoleUpdateDto } from './role.dto'

@Injectable()
export class RoleService {
  constructor(
    @Inject('PRISMA_CLIENT')
    private readonly prisma: ExtendedPrismaClient,
  ) {}

  async list() {
    return await this.prisma.role.findMany()
  }

  async info(id: number) {
    const info = await this.prisma.role.findUnique({ where: { id }, include: {
      menus: {
        where: {
          roles: { some: { id } },
        },
        select: {
          id: true,
        },
      },
    } })

    return info
  }

  async delete(id: number) {
    if (id === 1)
      throw new Error('不能删除超级管理员')

    await this.prisma.role.delete({
      where: { id },
    })
  }

  async create({ menuIds, ...data }: RoleDto): Promise<{ roleId: number }> {
    const role = await this.prisma.role.create({
      data: {
        ...data,
        // menus: {
        //   connectc: menuIds.map(id => ({ id })),
        // },
      },
    })

    return { roleId: role.id }
  }

  async update(id, { menuIds, ...data }: RoleUpdateDto) {
    await this.prisma.role.update({
      where: { id },
      data: {
        ...data,
        menus: {
          connect: menuIds.map(id => ({ id })),
        },
      },
    })
  }

  async getRolesByUser(id: number) {
    const roles = await this.prisma.role.findMany({
      where: {
        users: { some: { id } },
      },
    })

    return roles
  }

  async getRolesByIds(ids: number[]) {
    const roles = await this.prisma.role.findMany({
      where: {
        id: { in: ids },
      },
      select: { id: true },
    })

    return roles
  }

  async getDefaultRole() {
    return this.prisma.role.findFirst({ where: { default: true } })
  }

  async isAdminRoleByUser(uid: number) {
    return await this.prisma.role.exists({
      where: {
        users: { some: { id: uid } },
      },
    })
  }

  hasAdminRole(rids: number[]): boolean {
    return rids.includes(1)
  }

  async checkUserByRoleId(id: number): Promise<boolean> {
    return await this.prisma.role.exists({
      where: {
        users: {
          some: { id },
        },
      },
    })
  }
}
