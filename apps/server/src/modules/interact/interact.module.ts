import { Module, Provider } from '@nestjs/common'

import { UserModule } from '../user/user.module'

import { InteractTrpcRouter } from './interact.trpc'
import { CountingService } from './services/counting.service'
import { FollowService } from './services/follow.service'
import { LikeService } from './services/like.service'
import { ViewService } from './services/view.service'

const providers: Provider[] = [
  CountingService,
  LikeService,
  ViewService,
  FollowService,
  InteractTrpcRouter,
]

@Module({
  imports: [
    UserModule,
  ],
  providers,
  exports: providers,
})
export class InteractModule { }
