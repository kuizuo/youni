import { Injectable, OnModuleInit } from '@nestjs/common'

import { BatchDeleteDto } from '@server/common/dto/delete.dto'
import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'

import { InteractedNote } from '../note/note'
import { NotePublicService } from '../note/note.public.service'

import { HistoryCursorDto } from './history.dto'
import { HistoryService } from './history.service'

@TRPCRouter()
@Injectable()
export class HistoryTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly historyService: HistoryService,
    private readonly noteService: NotePublicService,
  ) { }

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('history', {
      list: procedureAuth
        .input(HistoryCursorDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          const { items, meta } = await this.historyService.paginate(input, user.id)

          const noteIds = items.map(item => item.noteId)

          const notes = await this.noteService.getNotesByIds(noteIds)

          return {
            items: await this.noteService.appendInteractInfoList(notes as InteractedNote[], user.id),
            meta,
          }
        }),
      batchDelete: procedureAuth
        .input(BatchDeleteDto.schema)
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt
          const { ids } = input

          return this.historyService.batchDelete(ids, user.id)
        }),
    })
  }
}
