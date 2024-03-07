import { CollectionTrpcRouter } from '@server/modules/collection/collection.trpc'
import { CommentTrpcRouter } from '@server/modules/comment/comment.trpc'
import { HistoryTrpcRouter } from '@server/modules/history/history.trpc'
import { InteractTrpcRouter } from '@server/modules/interact/interact.trpc'
import { NoteTrpcRouter } from '@server/modules/note/note.trpc'
import { TodoTrpcRouter } from '@server/modules/todo/todo.trpc'
import { UserTrpcRouter } from '@server/modules/user/user.trpc'

export type TRPCRouters = [
  UserTrpcRouter,
  TodoTrpcRouter,
  NoteTrpcRouter,
  HistoryTrpcRouter,
  CollectionTrpcRouter,
  CommentTrpcRouter,
  InteractTrpcRouter,
]
