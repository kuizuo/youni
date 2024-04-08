import { Module, Provider } from '@nestjs/common'

import { CampusAbility } from './campus.ability'
import { CampusController } from './campus.controller'
import { CampusService } from './campus.service'
import { CampusTrpcRouter } from './campus.trpc'

const providers: Provider[] = [CampusService, CampusTrpcRouter, CampusAbility]

@Module({
  controllers: [CampusController],
  providers,
  exports: [...providers],
})
export class CampusModule {}
