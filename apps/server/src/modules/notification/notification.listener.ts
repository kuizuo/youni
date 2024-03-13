import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { NotificationAction, NotificationSourceType } from '@youni/database'

import { CommentEvents } from '../comment/comment.constant'
import { CommentCreateEvent } from '../comment/events/comment-create.event'
import { UserFollowEvent } from '../interact/events/user-follow.event'
import { InteractEvents } from '../interact/interact.constant'
import { NoteCollectEvent } from '../note/events/note-collect.event'
import { NoteLikeEvent } from '../note/events/note-like.event'
import { NoteEvents } from '../note/note.constant'

import { NotificationService } from './notification.service'

@Injectable()
export class NotificationListener {
  constructor(
    private readonly notificationService: NotificationService,
  ) { }

  @OnEvent(NoteEvents.NoteLike)
  async handleNoteLikeEvent(event: NoteLikeEvent) {
    const { note, senderId } = event

    await this.notificationService.create({
      action: NotificationAction.Like,
      content: '',
      sourceId: note.id,
      sourceType: NotificationSourceType.Note,
      source: {
        title: note.title,
        image: note.cover,
      },
      senderId,
      recipientId: note.userId,
    })
  }

  @OnEvent(NoteEvents.NoteCollect)
  async handleNoteCollectEvent(event: NoteCollectEvent) {
    const { note, senderId } = event

    // await this.notificationService.create({
    //   action: NotificationAction.Collect,
    //   content: '',
    //   sourceId: note.id,
    //   sourceType: NotificationSourceType.Note,
    //   senderId,
    //   recipientId: note.userId,
    // })
  }

  // TODO:
  // @OnEvent(CommentEvents.CommentLike)
  // async handleCommentLikeEvent(event: NoteLikeEvent) {
  //   const { note, senderId } = event

  //   await this.notificationService.create({
  //     action: NotificationAction.Like,
  //     content: '',
  //     sourceId: note.id,
  //     sourceType: NotificationSourceType.Note,
  //     source: {
  //       id: note.id,
  //       type: NotificationSourceType.Note,
  //     },
  //     senderId,
  //     recipientId: note.userId,
  //   })
  // }

  @OnEvent(CommentEvents.CommentCreate)
  async handleCommentCreateEvent(event: CommentCreateEvent) {
    const { ref, comment, recipientId, senderId } = event

    // 评论了评论
    if (comment.parentId) {
      await this.notificationService.create({
        action: NotificationAction.Comment,
        content: comment.content,
        sourceId: comment.id,
        sourceType: NotificationSourceType.Comment,
        source: {
          title: ref.title,
          image: ref.cover,
        },
        senderId,
        recipientId,
      })
      return
    }

    // 评论了笔记
    await this.notificationService.create({
      action: NotificationAction.Comment,
      content: comment.content,
      sourceId: ref.id,
      sourceType: NotificationSourceType.Note,
      source: {
        title: ref.title,
        image: ref.cover,
      },
      senderId,
      recipientId,
    })
  }

  @OnEvent(InteractEvents.UserFollow)
  async handleUserFollowEvent(event: UserFollowEvent) {
    const { targetId, userId } = event

    await this.notificationService.create({
      action: NotificationAction.Follow,
      content: '',
      sourceId: targetId,
      sourceType: NotificationSourceType.User,
      source: {},
      senderId: userId,
      recipientId: targetId,
    })
  }
}
