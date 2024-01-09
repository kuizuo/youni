import { Inject, Injectable } from '@nestjs/common'

import { ExtendedPrismaClient } from '~/shared/database/prisma.extension'

@Injectable()
export class TodoService {
  constructor(
    @Inject('CUSTOM_PRISMA_CLIENT')
    private prisma: ExtendedPrismaClient,
  ) {
  }

  // async list({
  //   page,
  //   limit,
  // }: TodoQueryDto): Promise<Pagination<TodoEntity>> {
  //   return paginate(this.todoRepository, { page, limit })
  // }

  // async create(dto: TodoDto) {
  //   await this.todoRepository.save(dto)
  // }

  // async update(id: number, dto: TodoUpdateDto) {
  //   await this.todoRepository.update(id, dto)
  // }

  // async delete(id: number) {
  //   const item = await this.detail(id)
  //   await this.todoRepository.remove(item)
  // }

  async batchDelete(ids: number[]) {
    const items = await this.prisma.todo.deleteMany({
      where: {
        id: { in: ids },
      },
    })

    return items
  }
}
