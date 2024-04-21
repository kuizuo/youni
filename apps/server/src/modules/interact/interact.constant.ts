export enum InteractType {
  Note = 'Note',
  Tag = 'Tag',
  Comment = 'Comment',
}

export enum InteractEvents {
  UserFollow = 'user.follow',
}

export const INTERACT_QUEUE = 'interact'

export enum QueueProcess {
  UpdateItemCount = 'UpdateItemCount',
  UpdateCommentCount = 'UpdateCommentCount',
}
