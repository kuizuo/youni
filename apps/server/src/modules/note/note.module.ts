import { Module, Provider, forwardRef } from '@nestjs/common'

import { CampusModule } from '../campus/campus.module'
import { CollectionModule } from '../collection/collection.module'
import { CommentModule } from '../comment/comment.module'
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
    forwardRef(() => HistoryModule),
    forwardRef(() => CommentModule),
    InteractModule,
    CollectionModule,
    UserModule,
    CampusModule,
  ],
  controllers: [NoteController],
  providers,
  exports: [...providers],
})
export class NoteModule { }
