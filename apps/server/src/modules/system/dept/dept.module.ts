import { Module } from '@nestjs/common'

import { UserModule } from '../../user/user.module'
import { RoleModule } from '../role/role.module'

import { DeptController } from './dept.controller'
import { DeptService } from './dept.service'

@Module({
  imports: [
    UserModule,
    RoleModule,
  ],
  controllers: [DeptController],
  providers: [DeptService],
})
export class DeptModule {}
