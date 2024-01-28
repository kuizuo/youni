import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { BatchDeleteDto } from '~/common/dto/delete.dto'

import { Public } from '../auth/decorators/public.decorator'

import { TodoService } from './todo.service'

@ApiTags('Business - Todo模块')
@Public()
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {
  }

  @Post('batchDelete')
  async batchDelete(@Body() dto: BatchDeleteDto): Promise<void> {
    const { ids } = dto
    await this.todoService.batchDelete(ids)
  }
}
