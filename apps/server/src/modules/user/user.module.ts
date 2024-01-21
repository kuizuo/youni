import { Module } from '@nestjs/common'

import { RoleModule } from '../system/role/role.module'

import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [
    RoleModule,
    // MenuModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
