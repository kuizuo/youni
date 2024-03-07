import { Module, Provider, forwardRef } from '@nestjs/common'

import { NoteModule } from '../note/note.module'
import { UserModule } from '../user/user.module'

import { InteractTrpcRouter } from './interact.trpc'
import { FollowService } from './services/follow.service'
import { LikeService } from './services/like.service'
import { ViewService } from './services/view.service'

const providers: Provider[] = [
  LikeService,
  ViewService,
  FollowService,
  InteractTrpcRouter,
]

@Module({
  imports: [
    UserModule,
    forwardRef(() => NoteModule),
  ],
  providers,
  exports: providers,
})
export class InteractModule { }
