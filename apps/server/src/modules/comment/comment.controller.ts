import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { Idempotence } from '@server/common/decorators/idempotence.decorator'

import { IdDto } from '@server/common/dto/id.dto'
import { scheduleManager } from '@server/utils/schedule.util'

import { AuthUser } from '../auth/decorators/auth-user.decorator'

import { Action } from '../casl/ability.class'
import { Policy } from '../casl/policy.decortor'

import { InteractedComment } from './comment'
import { CommentCursorDto, CreateCommentDto, SubCommentCursorDto } from './comment.dto'
import { CommentService } from './comment.service'

@ApiTags('Business - 评论模块')
@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
  ) { }

  @Get('page')
  @ApiOperation({ summary: '获取评论列表' })
  async page(@Query() dto: CommentCursorDto, @AuthUser() user: IAuthUser) {
    const { items, meta } = await this.commentService.paginate(dto)

    return { items: await this.commentService.appendInteractInfoList(items as InteractedComment[], user.id), meta }
  }

  @Get(':id/sub/page')
  @ApiOperation({ summary: '获取子评论列表' })
  async list(@Query() dto: SubCommentCursorDto, @AuthUser() user: IAuthUser) {
    const { items, meta } = await this.commentService.paginateSubComment(dto)

    await this.commentService.appendInteractInfoList(items as InteractedComment[], user.id)

    return { items, meta }
  }

  @Post()
  @ApiOperation({ summary: '创建评论' })
  @Idempotence({ expired: 20, errorMessage: '请不要重复评论' })
  async create(
    @Body() dto: CreateCommentDto,
    @Ip() ip: string,
    @AuthUser() user: IAuthUser,
  ) {
    const comment = await this.commentService.createComment(dto, user.id)

    scheduleManager.schedule(async () => {
      await this.commentService.appendIpLocation(comment.id, ip)
    })

    // TODO: 评论通知

    return comment
  }

  @Post(':id/like')
  @ApiOperation({ summary: '点赞评论' })
  async like(@Param() { id }: IdDto, @AuthUser() user: IAuthUser) {
    return await this.commentService.likeComment(id, user.id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除评论' })
  @Policy({ model: 'Comment', action: Action.Delete })
  async delete(@Param() { id }: IdDto) {
    await this.commentService.delete(id)
  }
}
