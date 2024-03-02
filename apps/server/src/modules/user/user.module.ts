import { Module } from '@nestjs/common'

import { UserController } from './user.controller'
import { UserAbility } from './user.ability'
import { UserService } from './user.service'

@Module({
  controllers: [UserController],
  providers: [UserService, UserAbility],
  exports: [UserService],
})
export class UserModule {}
