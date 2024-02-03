import { Injectable } from '@nestjs/common'

import { ExtendedPrismaClient, InjectPrismaClient } from '../../shared/database/prisma.extension'

import { TodoDto, TodoPagerDto, TodoUpdateDto } from './todo.dto'

@Injectable()
export class TodoService {
  @InjectPrismaClient()
  private prisma: ExtendedPrismaClient

  async paginate({
    page,
    limit,
  }: TodoPagerDto, userId?: string) {
    const [items, meta] = await this.prisma.todo.paginate({
      where: {
        ...(userId && { userId }),
      },
    }).withPages({ page, limit, includePageCount: true })

    return {
      items,
      meta,
    }
  }

  async findOne(id: string) {
    return this.prisma.todo.findUniqueOrThrow({
      where: {
        id,
      },
    })
  }

  async create(dto: TodoDto, userId: string) {
    const { ...data } = dto
    return this.prisma.todo.create({
      data: {
        ...data,
        userId,
      },
    })
  }

  async update(id: string, dto: TodoUpdateDto) {
    return this.prisma.todo.update({
      where: { id },
      data: {
        ...dto,
      },
    })
  }

  async delete(id: string) {
    return this.prisma.todo.delete({
      where: {
        id,
      },
    })
  }

  async batchDelete(ids: string[], userId: string) {
    const items = await this.prisma.todo.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    })

    return items
  }
}
