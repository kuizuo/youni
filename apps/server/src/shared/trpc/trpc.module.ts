import { Global, Module } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'

import { AuthModule } from '~/modules/auth/auth.module'

import { TRPCService } from './trpc.service'

@Module({
  imports: [DiscoveryModule, AuthModule],
  exports: [TRPCService],
  providers: [TRPCService],
})
@Global()
export class TRPCModule {}
