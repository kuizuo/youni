import { Module, Provider, forwardRef } from '@nestjs/common'

import { InteractModule } from '../interact/interact.module'
import { NoteModule } from '../note/note.module'

import { UserAbility } from './user.ability'
import { UserController } from './user.controller'
import { UserPublicService } from './user.public.service'
import { UserService } from './user.service'
import { UserTrpcRouter } from './user.trpc'

const providers: Provider[] = [
  UserService,
  UserPublicService,
  UserTrpcRouter,
  UserAbility,
]

@Module({
  imports: [
    forwardRef(() => NoteModule),
    forwardRef(() => InteractModule),
  ],
  controllers: [UserController],
  providers,
  exports: providers,
})
export class UserModule { }
