import { Module, Provider } from '@nestjs/common'

import { InteractModule } from '../interact/interact.module'
import { UserModule } from '../user/user.module'

import { CommentAbility } from './comment.ability'
import { CommentController } from './comment.controller'
import { CommentListener } from './comment.listener'
import { CommentService } from './comment.service'
import { CommentTrpcRouter } from './comment.trpc'

const providers: Provider[] = [
  CommentService,
  CommentTrpcRouter,
  CommentAbility,
  CommentListener,
]

@Module({
  imports: [
    InteractModule,
    UserModule,
  ],
  controllers: [CommentController],
  providers,
  exports: [...providers],
})
export class CommentModule { }
