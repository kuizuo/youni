import { Module, Provider } from '@nestjs/common'

import { TodoController } from './todo.controller'
import { TodoService } from './todo.service'

const providers: Provider[] = [TodoService]

@Module({
  controllers: [TodoController],
  providers,
  exports: [...providers],
})
export class TodoModule {}
