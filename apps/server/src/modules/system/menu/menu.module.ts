import { Module, forwardRef } from '@nestjs/common'

import { RoleModule } from '../role/role.module'

import { MenuController } from './menu.controller'
import { MenuService } from './menu.service'

@Module({
  imports: [
    forwardRef(() => RoleModule),
  ],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
