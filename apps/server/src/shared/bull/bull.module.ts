import { BullModule as NestBullModule } from '@nestjs/bull'
import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { IRedisConfig } from '@server/config'

@Global()
@Module({
  imports: [
    NestBullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisOptions = configService.get<IRedisConfig>('redis')!

        return {
          redis: {
            host: redisOptions.host,
            port: redisOptions.port,
            password: redisOptions.password,
          },
        }
      },
      inject: [ConfigService],
    }),
  ],
})
export class BullModule { }
