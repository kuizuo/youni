import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BatchDeleteDto } from '@server/common/dto/delete.dto'
import { IdDto } from '@server/common/dto/id.dto'

import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { Action } from '../casl/ability.class'
import { Policy } from '../casl/policy.decortor'
import { PolicyGuard } from '../casl/policy.guard'

import { CampusDto, CampusPagerDto } from './campus.dto'
import { CampusService } from './campus.service'

@ApiTags('Business - 校区模块')
@UseGuards(PolicyGuard)
@Controller('campus')
export class CampusController {
  constructor(private readonly noteTagService: CampusService) { }

  @Get('page')
  @Policy({ model: 'Campus', action: Action.Manage })
  async list(@Query() dto: CampusPagerDto, @AuthUser() user: IAuthUser) {
    return this.noteTagService.paginate(dto)
  }

  @Get(':id')
  @Policy({ model: 'Campus', action: Action.Read })
  async findOne(@Param() { id }: IdDto, @AuthUser() user: IAuthUser) {
    return this.noteTagService.findOne(id)
  }

  @Post()
  @Policy({ model: 'Campus', action: Action.Create })
  async create(@Body() dto: CampusDto, @AuthUser() user: IAuthUser) {
    await this.noteTagService.create(dto)
  }

  @Delete(':id')
  @Policy({ model: 'Campus', action: Action.Delete })
  async delete(@Param() { id }: IdDto) {
    await this.noteTagService.delete(id)
  }

  @Delete()
  @Policy({ model: 'Campus', action: Action.Delete })
  async batchDelete(@Body() dto: BatchDeleteDto) {
    const { ids } = dto
    await this.noteTagService.batchDelete(ids)
  }
}
