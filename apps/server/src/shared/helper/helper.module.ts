import { Global, Module, type Provider } from '@nestjs/common'

import { CronService } from './cron.service'
import { SmsService } from './sms.service'

const providers: Provider[] = [
  CronService,
  SmsService,
]

@Global()
@Module({
  imports: [],
  providers,
  exports: providers,
})
export class HelperModule {}
