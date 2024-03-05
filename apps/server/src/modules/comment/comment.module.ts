import { Module, Provider } from '@nestjs/common'

import { InteractModule } from '../interact/interact.module'
import { UserModule } from '../user/user.module'

import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'
import { CommentTrpcRouter } from './comment.trpc'

const providers: Provider[] = [
  CommentService,
  CommentTrpcRouter,
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
