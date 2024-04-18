import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BatchDeleteDto } from '@server/common/dto/delete.dto'
import { IdDto } from '@server/common/dto/id.dto'

import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { Action } from '../casl/ability.class'
import { Policy } from '../casl/policy.decortor'
import { PolicyGuard } from '../casl/policy.guard'

import { NoteDto, NotePagerDto, NoteUpdateDto } from './note.dto'
import { NoteService } from './note.service'

@ApiTags('Business - 笔记模块')
@UseGuards(PolicyGuard)
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) { }

  @Get('page')
  @Policy({ model: 'Note', action: Action.Manage })
  async list(@Query() dto: NotePagerDto, @AuthUser() user: IAuthUser) {
    return this.noteService.paginate(dto, user.id)
  }

  @Get(':id')
  @Policy({ model: 'Note', action: Action.Read })
  async findOne(@Param() { id }: IdDto) {
    return this.noteService.findOne(id)
  }

  @Post()
  @Policy({ model: 'Note', action: Action.Create })
  async create(@Body() dto: NoteDto, @AuthUser() user: IAuthUser) {
    return await this.noteService.create(dto, user.id)
  }

  @Put(':id')
  @Policy({ model: 'Note', action: Action.Update })
  async update(@Param() { id }: IdDto, @Body() dto: NoteUpdateDto) {
    console.log(dto)
    return await this.noteService.update(id, dto)
  }

  @Delete(':id')
  @Policy({ model: 'Note', action: Action.Delete })
  async delete(@Param() { id }: IdDto) {
    return await this.noteService.delete(id)
  }

  @Delete()
  async batchDelete(@Body() dto: BatchDeleteDto, @AuthUser() user: IAuthUser) {
    const { ids } = dto
    return await this.noteService.batchDelete(ids, user.id)
  }
}
