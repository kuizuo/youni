import { Injectable, OnModuleInit } from '@nestjs/common'

import { BatchDeleteDto } from '@server/common/dto/delete.dto'
import { IdDto } from '@server/common/dto/id.dto'
import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'
import { z } from 'zod'

import { Action } from '../casl/ability.class'

import { HistoryService } from '../history/history.service'

import { NoteInputSchema, NotePagerDto } from './note.dto'
import { NoteService } from './note.service'

@TRPCRouter()
@Injectable()
export class NoteTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly noteService: NoteService,
    private readonly historyService: HistoryService,
  ) { }

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('note', {
      list: procedureAuth
        .input(NotePagerDto.schema)
        .meta({ model: 'Note', action: Action.Read })
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.noteService.paginate(input, user.id)
        }),
      id: procedureAuth
        .input(IdDto.schema)
        .meta({ model: 'Note', action: Action.Read })
        .query(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          const note = await this.noteService.findOne(id)

          if (note)
            await this.historyService.create(note.id, user.id)

          return note
        }),
      create: procedureAuth
        .input(NoteInputSchema)
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
