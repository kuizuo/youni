import { Injectable, OnModuleInit } from '@nestjs/common'

import { BatchDeleteDto } from '@server/common/dto/delete.dto'
import { IdDto } from '@server/common/dto/id.dto'
import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'
import { scheduleManager } from '@server/utils/schedule.util'
import { Note } from '@youni/database'
import { z } from 'zod'

import { Action } from '../casl/ability.class'

import { HistoryService } from '../history/history.service'

import { NoteCursorDto, NoteDto, NoteInputSchema, UserNoteCursorDto } from './note.dto'
import { NotePublicService } from './note.public.service'
import { NoteService } from './note.service'

@TRPCRouter()
@Injectable()
export class NoteTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly noteService: NoteService,
    private readonly notePublicService: NotePublicService,
    private readonly historyService: HistoryService,
  ) { }

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('note', {
      homeFeed: procedureAuth
        .input(NoteCursorDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          const { items, meta } = await this.notePublicService.homeFeed(input, user.id)

          await this.notePublicService.appendInteractInfo(items as unknown as Note[], user.id)

          return {
            items,
            meta,
          }
        }),
      byId: procedureAuth
        .input(IdDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          const note = await this.notePublicService.getNoteById(id)

          if (note) {
            scheduleManager.schedule(async () => {
              await this.historyService.create(note.id, user.id)
            })
          }

          await this.notePublicService.appendInteractInfo(note as unknown as Note, user.id, true)

          return note
        }),
      userNotes: procedureAuth
        .input(UserNoteCursorDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          const { items, meta } = await this.notePublicService.getNotesByUserId(input)

          await this.notePublicService.appendInteractInfo(items as unknown as Note[], user.id)

          return {
            items,
            meta,
          }
        }),
      userCollectNotes: procedureAuth
        .input(UserNoteCursorDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          // TODO: setting 判断用户设置是否允许查看
          const { items, meta } = await this.notePublicService.getNotesByCollectionId(input)

          await this.notePublicService.appendInteractInfo(items as unknown as Note[], user.id)

          return {
            items,
            meta,
          }
        }),
      userLikedNotes: procedureAuth
        .input(UserNoteCursorDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          // TODO: setting 判断用户设置是否允许查看
          const { items, meta } = await this.notePublicService.getUserLikedNotes(input)

          await this.notePublicService.appendInteractInfo(items as unknown as Note[], user.id)

          return {
            items,
            meta,
          }
        }),
      like: procedureAuth
        .input(IdDto.schema)
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          return this.notePublicService.likeNote(id, user.id)
        }),
      dislike: procedureAuth
        .input(IdDto.schema)
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          return this.notePublicService.dislikeNote(id, user.id)
        }),
      list: procedureAuth
        .input(NoteCursorDto.schema)
        .meta({ model: 'Note', action: Action.Read })
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.noteService.paginate(input, user.id)
        }),
      create: procedureAuth
        .input(NoteDto.schema)
        .meta({ model: 'Note', action: Action.Create })
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.noteService.create(input, user.id)
        }),
      update: procedureAuth
        .input(NoteInputSchema.extend({ id: z.string() }))
        .meta({ model: 'Note', action: Action.Update })
        .mutation(async (opt) => {
          const { input } = opt
          const { id, ...data } = input

          return this.noteService.update(id, data)
        }),
      delete: procedureAuth
        .input(IdDto.schema)
        .meta({ model: 'Note', action: Action.Delete })
        .mutation(async (opt) => {
          const { input } = opt
          const { id } = input

          return this.noteService.delete(id)
        }),
      batchDelete: procedureAuth
        .input(BatchDeleteDto.schema)
        .meta({ model: 'Note', action: Action.Delete })
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt
          const { ids } = input

          return this.noteService.batchDelete(ids, user.id)
        }),
    })
  }
}
