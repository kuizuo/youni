import { Module, Provider } from '@nestjs/common'

import { TodoController } from './todo.controller'
import { TodoService } from './todo.service'
import { TodoTrpcRouter } from './todo.trpc'

const providers: Provider[] = [TodoService, TodoTrpcRouter]

@Module({
  controllers: [TodoController],
  providers,
  exports: [...providers],
})
export class TodoModule {}
