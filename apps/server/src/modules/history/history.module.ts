import { Module, Provider } from '@nestjs/common'

import { HistoryController } from './history.controller'
import { HistoryService } from './history.service'
import { HistoryTrpcRouter } from './history.trpc'

const providers: Provider<any>[] = [
  HistoryService,
  HistoryTrpcRouter,
]

@Module({
  imports: [],
  controllers: [HistoryController],
  providers,
  exports: [...providers],
})
export class HistoryModule { }
