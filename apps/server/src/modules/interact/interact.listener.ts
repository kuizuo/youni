import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'

import { OnEvent } from '@nestjs/event-emitter'
import { Queue } from 'bull'

import { CommentEvents } from '../comment/comment.constant'
import { CommentCreateEvent } from '../comment/events/comment-create.event'
import { CommentLikeEvent } from '../comment/events/comment-like.event'
import { NoteCollectEvent } from '../note/events/note-collect.event'
import { NoteLikeEvent } from '../note/events/note-like.event'
import { NoteEvents } from '../note/note.constant'

import { INTERACT_QUEUE, InteractType, QueueProcess } from './interact.constant'

const DELAY = 3_000

@Injectable()
export class InteractListener {
  constructor(
    @InjectQueue(INTERACT_QUEUE) private interactQueue: Queue,
  ) { }

  @OnEvent(NoteEvents.NoteDislike)
  @OnEvent(NoteEvents.NoteLike)
  async handleNoteLikeAndDislikeEvent(event: NoteLikeEvent) {
    const { note } = event

    const itemType = InteractType.Note
    const itemId = note.id

    const jobId = `${itemType}-${itemId}-counting`
    await this.interactQueue.add(
      QueueProcess.UpdateItemCount,
      {
        itemType,
        itemId,
      },
      {
        delay: DELAY,
        jobId,
        removeOnComplete: true,
        removeOnFail: true,
      },
    )
  }

  @OnEvent(NoteEvents.NoteCollect)
  @OnEvent(NoteEvents.NoteUncollect)
  async handleNoteCollectAndUncollectEvent(event: NoteCollectEvent) {
    const { note } = event

    const itemType = InteractType.Note
    const itemId = note.id

    const jobId = `${itemType}-${itemId}-counting`
    await this.interactQueue.add(
      QueueProcess.UpdateItemCount,
      {
        itemType,
        itemId,
      },
      {
        delay: DELAY,
        jobId,
        removeOnComplete: true,
        removeOnFail: true,
      },
    )
  }

  @OnEvent(CommentEvents.CommentLike)
  @OnEvent(CommentEvents.CommentDislike)
  async handleCommentLikeEvent(event: CommentLikeEvent) {
    const { comment } = event

    const itemType = InteractType.Comment
    const itemId = comment.id

    const jobId = `${itemType}-${itemId}-counting`

    await this.interactQueue.add(
      QueueProcess.UpdateCommentCount,
      {
        itemType,
        itemId,
        refType: comment.refType,
        refId: comment.refId,
        parentId: comment.parentId,
      },
      {
        delay: DELAY,
        jobId,
        removeOnComplete: true,
        removeOnFail: true,
      },
    )
  }

  @OnEvent(CommentEvents.CommentCreate)
  async handleCommentCreateEvent(event: CommentCreateEvent) {
    const { comment } = event

    const itemType = comment.refType
    const itemId = comment.refId

    const jobId = `${itemType}-${itemId}-counting`

    // 更新子项数量
    await this.interactQueue.add(
      QueueProcess.UpdateItemCount,
      {
        itemType,
        itemId,
      },
      {
        delay: DELAY,
        jobId,
        removeOnComplete: true,
        removeOnFail: true,
      },
    )

    // 如果有父评论 则更新父评论数量
    if (comment.parentId) {
      const itemType = InteractType.Comment
      const itemId = comment.parentId
      const jobId = `${itemType}-${itemId}-counting`

      await this.interactQueue.add(
        QueueProcess.UpdateCommentCount,
        {
          itemType,
          itemId,
          refType: comment.refType,
          refId: comment.refId,
        },
        {
          delay: DELAY,
          jobId,
          removeOnComplete: true,
          removeOnFail: true,
        },
      )
    }
  }
}
