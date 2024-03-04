import { Injectable, OnModuleInit } from '@nestjs/common'

import { BatchDeleteDto } from '@server/common/dto/delete.dto'
import { IdDto } from '@server/common/dto/id.dto'
import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'
import { z } from 'zod'

import { Action } from '../casl/ability.class'

import { HistoryService } from '../history/history.service'

import { NoteCursorDto, NoteDto, NoteInputSchema } from './note.dto'
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

          const [items, meta] = await this.notePublicService.homeFeed(input, user.id)

          return {
            items: await this.notePublicService.addInteractInfoList(items, user.id),
            meta,
          }
        }),
      byId: procedureAuth
        .input(IdDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          const note = await this.notePublicService.getNoteById(id)

          if (note)
            await this.historyService.create(note.id, user.id)

          await this.notePublicService.addInteractInfo(note, user.id)

          return note
        }),
      like: procedureAuth
        .input(IdDto.schema)
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          return this.notePublicService.likeNote(id, user.id)
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
