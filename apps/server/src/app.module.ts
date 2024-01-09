import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, HttpAdapterHost } from '@nestjs/core'

import * as config from '~/config'
import { SharedModule } from '~/shared/shared.module'

import { AllExceptionsFilter } from './common/filters/any-exception.filter'

import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter'
import { IdempotenceInterceptor } from './common/interceptors/idempotence.interceptor'
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe'
import { SystemModule } from './modules/system/system.module'
import { DatabaseModule } from './shared/database/database.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      load: [...Object.values(config)],
    }),
    DatabaseModule,
    SharedModule,

    // AuthModule,
    SystemModule,
    // TasksModule,
    // ToolsModule,
    // HealthModule,
    // SocketModule,

    // biz
    // StoreModule, // 商店
    // CollectionModule, // 收藏
    // ReviewModule, // 评价
    // CommentModule, // 评论
    // NotificationModule, // 通知
    // InteractModule, // 交互
    // HistoryModule, // 历史浏览
    // ChatModule, // 聊天
    // end biz

    // TodoModule,
  ],
  providers: [

    // { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
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

    // { provide: APP_GUARD, useClass: JwtAuthGuard },
    // { provide: APP_GUARD, useClass: RbacGuard },
  ],
})
export class AppModule {}
