import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { InteractType } from '../interact/interact.constant'
import { CountingService } from '../interact/services/counting.service'

import { CommentEvents } from './comment.constant'
import { CommentService } from './comment.service'
import { CommentCreateEvent } from './events/comment-create.event'

@Injectable()
export class CommentListener {
  constructor(
    private readonly commentService: CommentService,
    private readonly countingService: CountingService,
  ) { }

  @OnEvent(CommentEvents.CommentCreate)
  async handleCommentCreateEvent(event: CommentCreateEvent) {
    const { comment } = event

    const count = await this.commentService.getCommentCount(comment.refType, comment.refId)
    await this.countingService.updateCommentCount(InteractType.Note, comment.refId, count)
  }
}
