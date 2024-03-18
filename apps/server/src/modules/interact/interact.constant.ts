export enum InteractType {
  Note = 'Note',
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
