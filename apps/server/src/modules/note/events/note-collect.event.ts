import { Note } from '@youni/database'

export class NoteCollectEvent {
  note: Note
  senderId: string

  public constructor(partial?: Partial<NoteCollectEvent>) {
    Object.assign(this, partial)
  }
}
