export type CommentItem = Awaited<
  ReturnType<import('./comment.service').CommentService['getCommentById']>
>
