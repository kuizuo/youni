import { Injectable } from '@nestjs/common'

import { CountingService } from '../interact/services/counting.service'

@Injectable()
export class NoteListener {
  constructor(
    private readonly countingService: CountingService,
  ) { }

  // @OnEvent(NoteEvents.NoteLike)
  // async handleNoteLikedEvent(event: NoteLikeEvent) {
  //   const { note } = event

  //   // await this.countingService.updateLikeCount(InteractType.Note, note.id)

  //   const job = await this.countingQueue.add('', { note }, {

  //   })
  // }
}
