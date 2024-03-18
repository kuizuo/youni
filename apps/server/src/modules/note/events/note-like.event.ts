import { Note } from '@youni/database'

export class NoteLikeEvent {
  note: Note
  senderId: string

  public constructor(partial?: Partial<NoteLikeEvent>) {
    Object.assign(this, partial)
  }
}
