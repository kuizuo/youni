import {
  Controller,
  Get,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { AuthUser } from '../auth/decorators/auth-user.decorator'

import { NotificationPagerDto } from './notification.dto'
import { NotificationService } from './notification.service'

@ApiTags('Business - 通知模块')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get()
  @ApiOperation({ summary: '获取通知列表' })
  async list(@AuthUser() user: IAuthUser, @Query() dto: NotificationPagerDto) {
    return this.notificationService.paginate(dto, user.id)
  }

  @Get('count')
  @ApiOperation({ summary: '获取通知数量' })
  async count(@AuthUser() user: IAuthUser) {
    return await this.notificationService.count(user.id)
  }
}
