import { Body, Controller, Delete, Get, Query } from '@nestjs/common'

import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { BatchDeleteDto } from '@server/common/dto/delete.dto'

import { AuthUser } from '../auth/decorators/auth-user.decorator'

import { HistoryCursorDto } from './history.dto'
import { HistoryService } from './history.service'

@ApiTags('Business - 历史记录模块')
@Controller('historys')
export class HistoryController {
  constructor(private historyService: HistoryService) { }

  @Get('page')
  @ApiOperation({ summary: '获取浏览记录' })
  async page(@Query() dto: HistoryCursorDto, @AuthUser() user: IAuthUser) {
    return this.historyService.paginate(dto, user.id)
  }

  @Delete('batchDelete')
  async batchDelete(@Body() dto: BatchDeleteDto, @AuthUser() user: IAuthUser) {
    return await this.historyService.batchDelete(dto.ids, user.id)
  }
}
