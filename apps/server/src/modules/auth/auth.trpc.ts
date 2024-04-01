import { Injectable, OnModuleInit } from '@nestjs/common'

import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'
import { z } from 'zod'

import { AuthService } from './auth.service'

@TRPCRouter()
@Injectable()
export class AuthTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly authService: AuthService,
  ) { }

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('auth', {
      logout: procedureAuth
        .input(z.undefined())
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt

          return await this.authService.clearLoginStatus(user.id)
        }),
    })
  }
}
