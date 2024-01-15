import { HttpModule } from '@nestjs/axios'
import { Global, Module, type Provider } from '@nestjs/common'

import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'

import { ThrottlerModule } from '@nestjs/throttler'

import { isDev } from '~/global/env'

import { CronService } from './cron.service'
import { MailerModule } from './mailer/mailer.module'
import { SmsService } from './sms.service'

const providers: Provider[] = [
  CronService,
  SmsService,
]

@Global()
@Module({
  imports: [
    // http
    HttpModule,
    // schedule
    ScheduleModule.forRoot(),
    // rate limit
    ThrottlerModule.forRoot([
      {
        limit: 3,
        ttl: 60000,
      },
    ]),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: isDev,
      ignoreErrors: false,
    }),
    // mailer
    MailerModule,
  ],
  providers,
  exports: providers,
})
export class HelperModule {}
