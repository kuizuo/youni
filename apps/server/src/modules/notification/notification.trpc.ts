import { Injectable, OnModuleInit } from '@nestjs/common'

import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'

import { NotificationPagerSchema } from './notification.dto'
import { NotificationService } from './notification.service'

@TRPCRouter()
@Injectable()
export class NotifactionTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly notificationService: NotificationService,
  ) { }

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('notification', {
      message: procedureAuth
        .input(NotificationPagerSchema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          return await this.notificationService.paginate(input, user.id)
        }),
      count: procedureAuth.query(async (opt) => {
        const { input, ctx: { user } } = opt

        return await this.notificationService.count(user.id)
      }),
    })
  }
}
