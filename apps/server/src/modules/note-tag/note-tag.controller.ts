import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BatchDeleteDto } from '@server/common/dto/delete.dto'
import { IdDto } from '@server/common/dto/id.dto'

import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { Action } from '../casl/ability.class'
import { Policy } from '../casl/policy.decortor'
import { PolicyGuard } from '../casl/policy.guard'

import { NoteTagDto, NoteTagPagerDto } from './note-tag.dto'
import { NoteTagService } from './note-tag.service'

@ApiTags('Business - 话题模块')
@UseGuards(PolicyGuard)
@Controller('note-tags')
export class NoteTagController {
  constructor(private readonly noteTagService: NoteTagService) { }

  @Get('page')
  @Policy({ model: 'Note', action: Action.Manage })
  async list(@Query() dto: NoteTagPagerDto, @AuthUser() user: IAuthUser) {
    return this.noteTagService.paginate(dto, user.id)
  }

  @Get(':id')
  @Policy({ model: 'Note', action: Action.Read })
  async findOne(@Param() { id }: IdDto, @AuthUser() user: IAuthUser) {
    return this.noteTagService.findOneById(id, user.id)
  }

  @Post()
  @Policy({ model: 'Note', action: Action.Create })
  async create(@Body() dto: NoteTagDto, @AuthUser() user: IAuthUser) {
    await this.noteTagService.create(dto)
  }

  @Delete(':id')
  @Policy({ model: 'Note', action: Action.Delete })
  async delete(@Param() { id }: IdDto) {
    await this.noteTagService.delete(id)
  }

  @Delete()
  @Policy({ model: 'Note', action: Action.Delete })
  async batchDelete(@Body() dto: BatchDeleteDto) {
    const { ids } = dto
    await this.noteTagService.batchDelete(ids)
  }
}
