import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BatchDeleteDto } from '@server/common/dto/delete.dto'
import { IdDto } from '@server/common/dto/id.dto'

import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { Action } from '../casl/ability.class'
import { Policy } from '../casl/policy.decortor'
import { PolicyGuard } from '../casl/policy.guard'

import { NoteCursorDto, NoteDto, NoteUpdateDto } from './note.dto'
import { NoteService } from './note.service'

@ApiTags('Business - 笔记模块')
@UseGuards(PolicyGuard)
@Controller('notes')
export class NoteController {
  constructor(private readonly todoService: NoteService) { }

  @Get()
  @Policy({ model: 'Note', action: Action.Read })
  async list(@Query() dto: NoteCursorDto, @AuthUser() user: IAuthUser) {
    return this.todoService.paginate(dto, user.id)
  }

  @Get(':id')
  @Policy({ model: 'Note', action: Action.Read })
  async findOne(@Param() { id }: IdDto) {
    return this.todoService.findOne(id)
  }

  @Post()
  @Policy({ model: 'Note', action: Action.Create })
  async create(@Body() dto: NoteDto, @AuthUser() user: IAuthUser) {
    await this.todoService.create(dto, user.id)
  }

  @Put(':id')
  @Policy({ model: 'Note', action: Action.Update })
  async update(@Param() { id }: IdDto, @Body() dto: NoteUpdateDto) {
    await this.todoService.update(id, dto)
  }

  @Delete(':id')
  @Policy({ model: 'Note', action: Action.Delete })
  async delete(@Param() { id }: IdDto) {
    await this.todoService.delete(id)
  }

  @Delete()
  async batchDelete(@Body() dto: BatchDeleteDto, @AuthUser() user: IAuthUser) {
    const { ids } = dto
    await this.todoService.batchDelete(ids, user.id)
  }
}
