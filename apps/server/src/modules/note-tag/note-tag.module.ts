import { Module, Provider } from '@nestjs/common'

import { InteractModule } from '../interact/interact.module'

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
  controllers: [],
  providers,
  exports: [...providers],
})
export class NoteTagModule { }
