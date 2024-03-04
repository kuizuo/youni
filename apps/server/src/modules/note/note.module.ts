import { Module, Provider } from '@nestjs/common'

import { CollectionModule } from '../collection/collection.module'
import { HistoryModule } from '../history/history.module'

import { InteractModule } from '../interact/interact.module'

import { UserModule } from '../user/user.module'

import { NoteAbility } from './note.ability'
import { NoteController } from './note.controller'
import { NotePublicService } from './note.public.service'
import { NoteService } from './note.service'
import { NoteTrpcRouter } from './note.trpc'

const providers: Provider[] = [
  NoteService,
  NotePublicService,
  NoteTrpcRouter,
  NoteAbility,
]

@Module({
  imports: [
    HistoryModule,
    CollectionModule,
    InteractModule,
    UserModule,
  ],
  controllers: [NoteController],
  providers,
  exports: [...providers],
})
export class NoteModule { }
