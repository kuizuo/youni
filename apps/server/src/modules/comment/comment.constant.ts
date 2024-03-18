import { Prisma } from '@youni/database'

export const CommentSelect: Prisma.CommentSelect = {
  id: true,
  content: true,
  location: true,
  interact: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      avatar: true,
      nickname: true,
    },
  },
}

export enum CommentRefType {
  Note = 'Note',
}

export enum CommentEvents {
  CommentLike = 'comment.like',
  CommentDislike = 'comment.dislike',
  CommentCreate = 'comment.create',
  // CommentAtUser = 'comment.atUser',
}
