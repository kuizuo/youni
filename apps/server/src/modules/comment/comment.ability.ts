import { AbilityBuilder } from '@casl/ability'
import { createPrismaAbility } from '@casl/prisma'
import { Injectable } from '@nestjs/common'

import { Role } from '@server/modules/auth/auth.constant'

import { Action, AppAbility, BaseAbility } from '../casl/ability.class'
import { DefineAbility } from '../casl/ability.decorator'

@DefineAbility('Comment')
@Injectable()
export class CommentAbility implements BaseAbility {
  createForUser(user: IAuthUser) {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)

    if (user.role === Role.Admin)
      can(Action.Manage, 'Comment')

    if (user.role === Role.User) {
      can(Action.Create, 'Comment')
      can(Action.Read, 'Comment')
      // can(Action.Update, 'Comment', { userId: user.id })
      can(Action.Delete, 'Comment', { userId: user.id })
    }

    return build()
  }
}
