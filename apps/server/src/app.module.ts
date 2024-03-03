import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE, HttpAdapterHost } from '@nestjs/core'

import * as config from '@server/config'

import { AllExceptionsFilter } from './common/filters/any-exception.filter'
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter'
import { IdempotenceInterceptor } from './common/interceptors/idempotence.interceptor'
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe'
import { AuthModule } from './modules/auth/auth.module'
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard'
import { CaslModule } from './modules/casl/casl.module'
import { CollectionModule } from './modules/collection/collection.module'
import { HealthModule } from './modules/health/health.module'
import { HistoryModule } from './modules/history/history.module'
import { NoteModule } from './modules/note/note.module'
import { UserModule } from './modules/user/user.module'
import { CacheModule } from './shared/cache/cache.module'
import { DatabaseModule } from './shared/database/database.module'
import { HelperModule } from './shared/helper/helper.module'
import { LoggerModule } from './shared/logger/logger.module'
import { RedisModule } from './shared/redis/redis.module'
import { TRPCModule } from './shared/trpc/trpc.module'
import { SocketModule } from './socket/socket.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      load: [...Object.values(config)],
    }),
    LoggerModule,
    CacheModule,
    DatabaseModule,
    RedisModule,
    HelperModule,

    AuthModule,
    UserModule,
    HealthModule,
    SocketModule,

    // biz
    NoteModule,
    CollectionModule,
    HistoryModule,
    // CommentModule, // 评论
    // InteractModule, // 交互
    // NotificationModule, // 通知
    // ChatModule, // 聊天
    // end biz

    // TodoModule,

    // wait module load
    CaslModule,
    TRPCModule,
  ],
  providers: [

    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useFactory: () => new TimeoutInterceptor(15 * 1000) },
    { provide: APP_INTERCEPTOR, useClass: IdempotenceInterceptor },

    { provide: APP_PIPE, useClass: ZodValidationPipe },

    {
      provide: APP_FILTER,
      useFactory: ({ httpAdapter }: HttpAdapterHost) => {
        return new PrismaClientExceptionFilter(httpAdapter)
      },
      inject: [HttpAdapterHost],
    },

    { provide: APP_FILTER, useClass: AllExceptionsFilter },

    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule { }
