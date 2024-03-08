import { Module, Provider } from '@nestjs/common'

import { UserModule } from '../user/user.module'

import { CollectionController } from './collection.controller'
import { CollectionService } from './collection.service'
import { CollectionTrpcRouter } from './collection.trpc'

const providers: Provider[] = [CollectionService, CollectionTrpcRouter]

@Module({
  imports: [
    UserModule,
  ],
  controllers: [CollectionController],
  providers,
  exports: [...providers],
})
export class CollectionModule { }
