import { Inject, Injectable } from '@nestjs/common'
import { isEmpty } from 'lodash'

import { BusinessException } from '~/common/exceptions/biz.exception'
import { ErrorEnum } from '~/constants/error-code.constant'

import { ExtendedPrismaClient } from '~/shared/database/prisma.extension'

import { DeptDto } from './dept.dto'

@Injectable()
export class DeptService {
  constructor(
    @Inject('PRISMA_CLIENT')
    private readonly prisma: ExtendedPrismaClient,
  ) {}

  async list(uid: number) {
    return this.prisma.dept.findMany({
      where: {
        userId: uid,
      },
      orderBy: { orderNo: 'desc' },
    })
  }

  async info(id: number) {
    const dept = await this.prisma.dept.findUnique({
      where: { id },
      include: {
        parent: true,
      },
    })

    if (isEmpty(dept))
      throw new BusinessException(ErrorEnum.DEPARTMENT_NOT_FOUND)

    return dept
  }

  async create({ parentId, ...data }: DeptDto) {
    return await this.prisma.dept.create({
      data: {
        ...data,
        parent: {
          connect: {
            id: parentId,
          },
        },
      },
    })
  }

  async update(id: number, { parentId, ...data }: DeptDto) {
    return await this.prisma.dept.update({
      where: { id },
      data: {
        ...data,
        parent: {
          connect: { id: parentId },
        },
      },
    })
  }

  async delete(id: number) {
    await this.prisma.dept.delete({ where: { id } })
  }

  async countUserByDeptId(id: number): Promise<number> {
    return this.prisma.user.count({
      where: {
        deptId: id,
      },
    })
  }

  /**
   * 查找当前部门下的子部门数量
   */
  async countChildDept(id: number): Promise<number> {
    const dept = await this.prisma.dept.findUnique({
      where: { id },
      include: {
        children: true,
      },
    })
    return dept.children.length
  }
}
