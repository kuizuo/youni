import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BatchDeleteDto } from '@server/common/dto/delete.dto'
import { IdDto } from '@server/common/dto/id.dto'

import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { Action } from '../casl/ability.class'
import { Policy } from '../casl/policy.decortor'
import { PolicyGuard } from '../casl/policy.guard'

import { TagDto, TagPagerDto } from './tag.dto'
import { TagService } from './tag.service'

@ApiTags('Business - 话题模块')
@UseGuards(PolicyGuard)
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) { }

  @Get('page')
  @Policy({ model: 'Note', action: Action.Manage })
  async list(@Query() dto: TagPagerDto, @AuthUser() user: IAuthUser) {
    return this.tagService.paginate(dto, user.id)
  }

  @Get(':id')
  @Policy({ model: 'Note', action: Action.Read })
  async findOne(@Param() { id }: IdDto, @AuthUser() user: IAuthUser) {
    return this.tagService.findOne(id, user.id)
  }

  @Post()
  @Policy({ model: 'Note', action: Action.Create })
  async create(@Body() dto: TagDto, @AuthUser() user: IAuthUser) {
    await this.tagService.create(dto)
  }

  @Delete(':id')
  @Policy({ model: 'Note', action: Action.Delete })
  async delete(@Param() { id }: IdDto) {
    await this.tagService.delete(id)
  }

  @Delete()
  @Policy({ model: 'Note', action: Action.Delete })
  async batchDelete(@Body() dto: BatchDeleteDto) {
    const { ids } = dto
    await this.tagService.batchDelete(ids)
  }
}
