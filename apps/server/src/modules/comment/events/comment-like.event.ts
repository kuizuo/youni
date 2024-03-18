import { Comment } from '@youni/database'

export class CommentLikeEvent {
  comment: Comment
  senderId: string
  recipientId: string

  public constructor(partial?: Partial<CommentLikeEvent>) {
    Object.assign(this, partial)
  }
}
