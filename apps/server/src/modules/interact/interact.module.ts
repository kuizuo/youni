import { BullModule } from '@nestjs/bull'
import { Module, Provider } from '@nestjs/common'

import { UserModule } from '../user/user.module'

import { INTERACT_QUEUE } from './interact.constant'
import { InteractListener } from './interact.listener'
import { InteractProcessor } from './interact.processor'
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
  InteractListener,
  InteractProcessor,
]

@Module({
  imports: [
    UserModule,
    BullModule.registerQueue(
      {
        name: INTERACT_QUEUE,
      },
    ),
  ],
  providers,
  exports: providers,
})
export class InteractModule { }
