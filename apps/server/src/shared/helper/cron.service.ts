import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CronExpression } from '@nestjs/schedule'
import dayjs from 'dayjs'

import { CronOnce } from '~/common/decorators/cron-once.decorator'

import { ExtendedPrismaClient, InjectPrismaClient } from '../database/prisma.extension'

@Injectable()
export class CronService {
  private logger: Logger
  constructor(
    @InjectPrismaClient()
    private readonly prisma: ExtendedPrismaClient,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger(CronService.name)
  }

  @CronOnce(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredJWT() {
    this.logger.log('--> 开始扫表，清除过期的 token')

    const expiredTokens = await this.prisma.token.findMany({
      where: {
        expiredAt: {
          lte: new Date(),
        },
      },
    })

    let deleteCount = 0
    await Promise.all(
      expiredTokens.map(async (token) => {
        const { id, value, createdAt } = token

        await this.prisma.token.delete({ where: { id } })

        this.logger.debug(
            `--> 删除过期的 token：${value}, 签发于 ${dayjs(createdAt).format(
              'YYYY-MM-DD H:mm:ss',
            )}`,
        )

        deleteCount += 1
      }),
    )

    this.logger.log(`--> 删除了 ${deleteCount} 个过期的 token`)
  }
}
