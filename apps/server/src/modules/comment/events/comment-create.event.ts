import { Comment, Note } from '@youni/database'

export class CommentCreateEvent {
  source: Note
  comment: Comment
  senderId: string
  recipientId: string

  public constructor(partial?: Partial<CommentCreateEvent>) {
    Object.assign(this, partial)
  }
}
