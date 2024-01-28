import { Injectable, OnModuleInit } from '@nestjs/common'

import { TRPCRouter } from '~/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '~/shared/trpc/trpc.helper'
import { TRPCService } from '~/shared/trpc/trpc.service'

import { TodoService } from './todo.service'

@TRPCRouter()
@Injectable()
export class TodoTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>
  constructor(private readonly trpcService: TRPCService, private readonly todoService: TodoService) {}

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('todo', {
      list: procedureAuth.query(() => []),
    })
  }
}
