import { Module, Provider } from '@nestjs/common'

import { UserModule } from '../user/user.module'

import { NotificationController } from './notification.controller'
import { NotificationListener } from './notification.listener'
import { NotificationService } from './notification.service'
import { NotifactionTrpcRouter } from './notification.trpc'

const providers: Provider[] = [
  NotificationService,
  NotifactionTrpcRouter,
  NotificationListener,
]

@Module({
  imports: [
    UserModule,
  ],
  controllers: [NotificationController],
  providers,
  exports: [...providers],
})
export class NotificationModule { }
