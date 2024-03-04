import { Module, Provider } from '@nestjs/common'

import { FollowService } from './services/follow.service'
import { LikeService } from './services/like.service'
import { ViewService } from './services/view.service'

const providers: Provider[] = [
  LikeService,
  ViewService,
  FollowService,
]

@Module({
  providers,
  exports: providers,
})
export class InteractModule {}
