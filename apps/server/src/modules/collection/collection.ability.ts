import { AbilityBuilder } from '@casl/ability'
import { createPrismaAbility } from '@casl/prisma'
import { Injectable } from '@nestjs/common'

import { Role } from '@server/modules/auth/auth.constant'

import { Action, AppAbility, BaseAbility } from '../casl/ability.class'
import { DefineAbility } from '../casl/ability.decorator'

@DefineAbility('Collection')
@Injectable()
export class CollectionAbility implements BaseAbility {
  createForUser(user: IAuthUser) {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)

    if (user.role === Role.User) {
      can(Action.Create, 'Collection')
      can(Action.Read, 'Collection', { published: true })
      can(Action.Update, 'Collection', { userId: user.id })
      can(Action.Delete, 'Collection', { userId: user.id })
    }

    return build()
  }
}
