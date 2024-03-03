import { CollectionTrpcRouter } from '@server/modules/collection/collection.trpc'
import { HistoryTrpcRouter } from '@server/modules/history/history.trpc'
import { NoteTrpcRouter } from '@server/modules/note/note.trpc'
import { TodoTrpcRouter } from '@server/modules/todo/todo.trpc'

export type TRPCRouters = [
  TodoTrpcRouter,
  NoteTrpcRouter,
  HistoryTrpcRouter,
  CollectionTrpcRouter,
]
