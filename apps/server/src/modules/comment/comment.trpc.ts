import { Injectable, OnModuleInit } from '@nestjs/common'

import { IdDto } from '@server/common/dto/id.dto'
import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'

import { Action } from '../casl/ability.class'

import { CommentPagerDto, CreateCommentDto, SubCommentPagerDto } from './comment.dto'
import { CommentService } from './comment.service'

@TRPCRouter()
@Injectable()
export class CommentTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly commentService: CommentService,
  ) { }

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('comment', {
      page: procedureAuth
        .input(CommentPagerDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          const { items, meta } = await this.commentService.paginate(input)

          await this.commentService.appendInteractInfo(items, user.id)
          return { items, meta }
        }),
      subPage: procedureAuth
        .input(SubCommentPagerDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          const { items, meta } = await this.commentService.paginateSubComment(input)

          await this.commentService.appendInteractInfo(items, user.id)

          return { items, meta }
        }),
      create: procedureAuth
        .input(CreateCommentDto.schema)
        .meta({ model: 'Comment', action: Action.Create })
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.commentService.createComment(input, user.id)
        }),
      delete: procedureAuth
        .input(IdDto.schema)
        .meta({ model: 'Comment', action: Action.Delete })
        .mutation(async (opt) => {
          const { input } = opt
          const { id } = input

          return this.commentService.deleteComment(id)
        }),
      like: procedureAuth
        .input(IdDto.schema)
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          return this.commentService.likeComment(id, user.id)
        }),
      dislike: procedureAuth
        .input(IdDto.schema)
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          return this.commentService.dislikeComment(id, user.id)
        }),
    })
  }
}
