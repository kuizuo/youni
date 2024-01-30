import { ModuleMetadata } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { NestFastifyApplication } from '@nestjs/platform-fastify'

import { Test } from '@nestjs/testing'

import { fastifyApp } from '@server/common/adapters/fastify.adapter'
import { AllExceptionsFilter } from '@server/common/filters/any-exception.filter'
import { ZodValidationPipe } from '@server/common/pipes/zod-validation.pipe'
import * as config from '@server/config'
import { CacheModule } from '@server/shared/cache/cache.module'
import { DatabaseModule } from '@server/shared/database/database.module'

import { HelperModule } from '@server/shared/helper/helper.module'

import { LoggerModule } from '@server/shared/logger/logger.module'
import { RedisModule } from '@server/shared/redis/redis.module'

export function createE2EApp(module: ModuleMetadata) {
  const proxy: {
    app: NestFastifyApplication
  } = {} as any

  beforeAll(async () => {
    const { ...nestModule } = module
    nestModule.imports ||= []
    nestModule.imports.push(
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
        load: [...Object.values(config)],
      }),
      LoggerModule,

      CacheModule,
      DatabaseModule,
      RedisModule,
      HelperModule,
    )
    nestModule.providers ||= []

    nestModule.providers.push(
      {
        provide: APP_PIPE,
        useClass: ZodValidationPipe,
      },
      // {
      //   provide: APP_INTERCEPTOR,
      //   useClass: TransformInterceptor,
      // },
      {
        provide: APP_FILTER,
        useClass: AllExceptionsFilter,
      },
    )

    const testingModule = await Test.createTestingModule(nestModule).compile()

    const app = testingModule.createNestApplication<NestFastifyApplication>(
      fastifyApp,
      { logger: ['log', 'warn', 'error', 'debug'] },
    )

    await app.init()

    await app.getHttpAdapter().getInstance().ready()

    proxy.app = app
  })

  return proxy
}
