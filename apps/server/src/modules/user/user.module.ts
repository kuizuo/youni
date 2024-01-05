import { Module } from '@nestjs/common'

import { MenuModule } from '../system/menu/menu.module'
import { RoleModule } from '../system/role/role.module'

import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [
    RoleModule,
    MenuModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
