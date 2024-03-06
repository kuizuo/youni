import { Module } from '@nestjs/common'

import { UserAbility } from './user.ability'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  controllers: [UserController],
  providers: [UserService, UserAbility],
  exports: [UserService],
})
export class UserModule {}
