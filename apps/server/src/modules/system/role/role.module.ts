import { Module, forwardRef } from '@nestjs/common'

import { MenuModule } from '../menu/menu.module'

import { RoleController } from './role.controller'
import { RoleService } from './role.service'

const providers = [RoleService]

@Module({
  imports: [
    forwardRef(() => MenuModule),
  ],
  controllers: [RoleController],
  providers,
  exports: providers,
})
export class RoleModule {}
