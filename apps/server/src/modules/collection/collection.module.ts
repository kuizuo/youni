import { Module, Provider } from '@nestjs/common'

import { CollectionAbility } from './collection.ability'
import { CollectionController } from './collection.controller'
import { CollectionService } from './collection.service'
import { CollectionTrpcRouter } from './collection.trpc'

const providers: Provider[] = [
  CollectionService,
  CollectionTrpcRouter,
  CollectionAbility,
]

@Module({
  imports: [],
  controllers: [CollectionController],
  providers,
  exports: [...providers],
})
export class CollectionModule { }
