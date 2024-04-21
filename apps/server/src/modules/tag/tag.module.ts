import { Module, Provider } from '@nestjs/common'

import { InteractModule } from '../interact/interact.module'

import { TagController } from './tag.controller'
import { TagService } from './tag.service'
import { TagTrpcRouter } from './tag.trpc'

const providers: Provider[] = [
  TagService,
  TagTrpcRouter,
]

@Module({
  imports: [
    InteractModule,
  ],
  controllers: [
    TagController,
  ],
  providers,
  exports: [...providers],
})
export class TagModule { }
