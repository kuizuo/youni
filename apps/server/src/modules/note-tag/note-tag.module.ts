import { Module, Provider } from '@nestjs/common'

import { InteractModule } from '../interact/interact.module'

import { NoteTagController } from './note-tag.controller'
import { NoteTagService } from './note-tag.service'
import { NoteTagTrpcRouter } from './note-tag.trpc'

const providers: Provider[] = [
  NoteTagService,
  NoteTagTrpcRouter,
]

@Module({
  imports: [
    InteractModule,
  ],
  controllers: [
    NoteTagController,
  ],
  providers,
  exports: [...providers],
})
export class NoteTagModule { }
