import { NoteItem } from '../note'

export class NoteLikeEvent {
  note: NoteItem
  senderId: string

  public constructor(partial?: Partial<NoteLikeEvent>) {
    Object.assign(this, partial)
  }
}
