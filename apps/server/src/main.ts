import cluster from 'node:cluster'
import path from 'node:path'

import {
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestFastifyApplication } from '@nestjs/platform-fastify'

import { AppModule } from './app.module'

import { fastifyApp } from './common/adapters/fastify.adapter'
import { RedisIoAdapter } from './common/adapters/socket.adapter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import type { IAppConfig } from './config'
import { isDev, isMainProcess } from './global/env'
import { setupSwagger } from './setup-swagger'
import { MyLogger } from './shared/logger/logger.service'

declare const module: any

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyApp,
    {
      bufferLogs: true,
      snapshot: true,
    },
  )

  const configService = app.get(ConfigService)

  const { port, globalPrefix } = configService.get<IAppConfig>('app')!

  app.enableCors({ origin: '*', credentials: true })
  app.setGlobalPrefix(globalPrefix)
  app.useStaticAssets({ root: path.join(__dirname, '..', 'public') })

  isDev && app.useGlobalInterceptors(new LoggingInterceptor())

  app.useWebSocketAdapter(new RedisIoAdapter(app))

  setupSwagger(app, configService)

  await app.listen(port, '0.0.0.0', async () => {
    app.useLogger(app.get(MyLogger))
    const url = await app.getUrl()
    const { pid } = process
    const env = cluster.isPrimary
    const prefix = env ? 'P' : 'W'

    if (!isMainProcess)
      return

    const logger = new Logger('NestApplication')
    logger.log(`[${prefix + pid}] Server running on ${url}`)

    if (isDev)
      logger.log(`[${prefix + pid}] OpenAPI: ${url}/api-docs`)
  })

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}

bootstrap()
