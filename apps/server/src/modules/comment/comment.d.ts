export type InteractedComment = Awaited<
  ReturnType<import('./comment.service').CommentService['paginate']>
>['items'][0] & {
  interactInfo: {
    liked: boolean
    likeCount: number
    commentCount: number
  }
}
