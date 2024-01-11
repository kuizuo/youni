import { Injectable } from '@nestjs/common'

import { BizException } from '~/common/exceptions/biz.exception'
import { ExtendedPrismaClient, InjectPrismaClient } from '~/shared/database/prisma.extension'

import { resourceNotFoundWrapper } from '~/utils/prisma.util'

import { RoleDto, RoleUpdateDto } from './role.dto'

@Injectable()
export class RoleService {
  constructor(
    @InjectPrismaClient()
    private readonly prisma: ExtendedPrismaClient,
  ) {}

  async list() {
    return await this.prisma.role.findMany()
  }

  async getRoleById(id: number) {
    return this.prisma.role.findUniqueOrThrow({ where: { id }, include: {
      menus: {
        where: {
          roles: { some: { id } },
        },
        select: {
          id: true,
        },
      },
    } }).catch(resourceNotFoundWrapper(new BizException('角色未找到')))
  }

  async delete(id: number) {
    if (id === 1)
      throw new Error('不能删除超级管理员')

    await this.prisma.role.delete({
      where: { id },
    })
  }

  async create(dto: RoleDto) {
    const { menuIds, ...data } = dto

    const role = await this.prisma.role.upsert({
      where: {
        value: data.value,
      },
      create: {
        ...data,
        menus: {
          connect: menuIds.map(id => ({ id })),
        },
      },
      update: {
        ...data,
        menus: {
          connect: menuIds.map(id => ({ id })),
        },
      },
    })

    return role
  }

  async update(id: number, dto: RoleUpdateDto) {
    const { menuIds, ...data } = dto

    await this.prisma.role.update({
      where: { id },
      data: {
        ...data,
        menus: {
          connect: menuIds!.map(id => ({ id })),
        },
      },
    })
  }

  async getRolesByUserId(id: string) {
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

  async isAdminRoleByUser(uid: string) {
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
    return await this.prisma.user.exists({
      where: {
        roles: {
          some: { id },
        },
      },
    })
  }
}
