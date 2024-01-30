import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { BatchDeleteDto } from '@server/common/dto/delete.dto'

import { IdDto } from '@server/common/dto/id.dto'

import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { Public } from '../auth/decorators/public.decorator'

import { TodoDto, TodoPagerDto, TodoUpdateDto } from './todo.dto'
import { TodoService } from './todo.service'

@ApiTags('Business - Todo模块')
@Public()
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async list(@Query() dto: TodoPagerDto, @AuthUser() user: IAuthUser) {
    return this.todoService.paginate(dto, user.uid)
  }

  @Get(':id')
  async findOne(@Param() { id }: IdDto, @AuthUser() user: IAuthUser) {
    return this.todoService.findOne(id, user.uid)
  }

  @Post()
  async create(@Body() dto: TodoDto, @AuthUser() user: IAuthUser) {
    await this.todoService.create(dto, user.uid)
  }

  @Put(':id')
  async update(@Param() { id }: IdDto, @Body() dto: TodoUpdateDto, @AuthUser() user: IAuthUser) {
    await this.todoService.update(id, dto, user.uid)
  }

  @Delete(':id')
  async delete(@Param(){ id }: IdDto, @AuthUser() user: IAuthUser) {
    await this.todoService.delete(id, user.uid)
  }

  @Delete()
  async batchDelete(@Body() dto: BatchDeleteDto, @AuthUser() user: IAuthUser) {
    const { ids } = dto
    await this.todoService.batchDelete(ids, user.uid)
  }
}
