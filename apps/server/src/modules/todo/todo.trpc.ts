import { Injectable, OnModuleInit } from '@nestjs/common'

import { BatchDeleteDto } from '@server/common/dto/delete.dto'
import { IdDto } from '@server/common/dto/id.dto'
import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'
import { z } from 'zod'

import { TodoInputSchema, TodoPagerDto } from './todo.dto'
import { TodoService } from './todo.service'

@TRPCRouter()
@Injectable()
export class TodoTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly todoService: TodoService,
  ) {}

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('todo', {
      list: procedureAuth.input(TodoPagerDto.schema).query(async (opt) => {
        const { input, ctx: { user } } = opt

        return this.todoService.paginate(input, user.uid)
      }),
      id: procedureAuth.input(IdDto.schema).query(async (opt) => {
        const { input: { id }, ctx: { user } } = opt

        return this.todoService.findOne(id, user.uid)
      }),
      create: procedureAuth.input(TodoInputSchema).mutation(async (opt) => {
        const { input, ctx: { user } } = opt

        return this.todoService.create(input, user.uid)
      }),
      update: procedureAuth.input(TodoInputSchema.extend({ id: z.string() })).mutation(async (opt) => {
        const { input, ctx: { user } } = opt
        const { id, ...data } = input

        return this.todoService.update(id, data, user.uid)
      }),
      delete: procedureAuth.input(IdDto.schema).mutation(async (opt) => {
        const { input, ctx: { user } } = opt
        const { id } = input

        return this.todoService.delete(id, user.uid)
      }),
      batchDelete: procedureAuth.input(BatchDeleteDto.schema).mutation(async (opt) => {
        const { input, ctx: { user } } = opt
        const { ids } = input

        return this.todoService.batchDelete(ids, user.uid)
      }),
    })
  }
}
