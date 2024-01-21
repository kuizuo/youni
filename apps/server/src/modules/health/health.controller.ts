import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  DiskHealthIndicator,
  HealthCheck,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus'

import { PrismaClient } from '@youni/prisma'

import { InjectPrismaClient } from '~/shared/database/prisma.extension'

@ApiTags('Health - 健康检查')
@Controller('health')
export class HealthController {
  constructor(
    private http: HttpHealthIndicator,
    private db: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @InjectPrismaClient()
  private readonly prisma: PrismaClient

  @Get('network')
  @HealthCheck()
  async checkNetwork() {
    return this.http.pingCheck('kuizuo', 'https://kuizuo.cn')
  }

  @Get('database')
  @HealthCheck()
  async checkDatabase() {
    return this.db.pingCheck('database', this.prisma)
  }

  @Get('memory-heap')
  @HealthCheck()
  async checkMemoryHeap() {
    // the process should not use more than 200MB memory
    return this.memory.checkHeap('memory-heap', 200 * 1024 * 1024)
  }

  @Get('memory-rss')
  @HealthCheck()
  async checkMemoryRSS() {
    // the process should not have more than 1024MB RSS memory allocated
    return this.memory.checkRSS('memory-rss', 1024 * 1024 * 1024)
  }

  @Get('disk')
  @HealthCheck()
  async checkDisk() {
    return this.disk.checkStorage('disk', {
      // The used disk storage should not exceed 75% of the full disk size
      thresholdPercent: 0.75,
      path: '/',
    })
  }
}
