import { AuthTrpcRouter } from '@server/modules/auth/auth.trpc'
import { CampusTrpcRouter } from '@server/modules/campus/campus.trpc'
import { CollectionTrpcRouter } from '@server/modules/collection/collection.trpc'
import { CommentTrpcRouter } from '@server/modules/comment/comment.trpc'
import { HistoryTrpcRouter } from '@server/modules/history/history.trpc'
import { InteractTrpcRouter } from '@server/modules/interact/interact.trpc'
import { NoteTrpcRouter } from '@server/modules/note/note.trpc'
import { NotifactionTrpcRouter } from '@server/modules/notification/notification.trpc'
import { TagTrpcRouter } from '@server/modules/tag/tag.trpc'
import { TodoTrpcRouter } from '@server/modules/todo/todo.trpc'
import { UserTrpcRouter } from '@server/modules/user/user.trpc'

export type TRPCRouters = [
  AuthTrpcRouter,
  UserTrpcRouter,
  TodoTrpcRouter,
  NoteTrpcRouter,
  TagTrpcRouter,
  HistoryTrpcRouter,
  CollectionTrpcRouter,
  CommentTrpcRouter,
  InteractTrpcRouter,
  NotifactionTrpcRouter,
  CampusTrpcRouter,
]
