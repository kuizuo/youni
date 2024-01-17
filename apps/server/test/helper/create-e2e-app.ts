import { ModuleMetadata } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { NestFastifyApplication } from '@nestjs/platform-fastify'

import { Test } from '@nestjs/testing'

import { fastifyApp } from '~/common/adapters/fastify.adapter'
import { AllExceptionsFilter } from '~/common/filters/any-exception.filter'
import { ZodValidationPipe } from '~/common/pipes/zod-validation.pipe'
import { CacheModule } from '~/shared/cache/cache.module'
import { DatabaseModule } from '~/shared/database/database.module'

import { HelperModule } from '~/shared/helper/helper.module'

import { LoggerModule } from '~/shared/logger/logger.module'
import { RedisModule } from '~/shared/redis/redis.module'

import * as config from '@/config'

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
