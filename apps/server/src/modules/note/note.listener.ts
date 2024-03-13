import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { InteractType } from '../interact/interact.constant'
import { CountingService } from '../interact/services/counting.service'

import { LikeService } from '../interact/services/like.service'

import { NoteLikeEvent } from './events/note-like.event'
import { NoteEvents } from './note.constant'

@Injectable()
export class NoteListener {
  constructor(
    private readonly likeService: LikeService,
    private readonly countingService: CountingService,
  ) { }

  @OnEvent(NoteEvents.NoteLike)
  async handleNoteLikeEvent(event: NoteLikeEvent) {
    const { note, senderId } = event

    const ok = await this.likeService.like(InteractType.Note, note.id, senderId)

    // FIXME: use Timed tasks update count
    if (ok)
      await this.countingService.updateLikeCount(InteractType.Note, note.id)
  }

  @OnEvent(NoteEvents.NoteDislike)
  async handleNoteDisLikeEvent(event: NoteLikeEvent) {
    const { note, senderId } = event

    const ok = await this.likeService.dislike(InteractType.Note, note.id, senderId)

    if (ok)
      await this.countingService.updateLikeCount(InteractType.Note, note.id)
  }
}
