import { Module, Provider, forwardRef } from '@nestjs/common'

import { NoteModule } from '../note/note.module'

import { HistoryController } from './history.controller'
import { HistoryService } from './history.service'
import { HistoryTrpcRouter } from './history.trpc'

const providers: Provider<any>[] = [
  HistoryService,
  HistoryTrpcRouter,
]

@Module({
  imports: [
    forwardRef(() => NoteModule),
  ],
  controllers: [HistoryController],
  providers,
  exports: [...providers],
})
export class HistoryModule { }
