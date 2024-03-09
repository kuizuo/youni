import { AbilityBuilder } from '@casl/ability'
import { createPrismaAbility } from '@casl/prisma'
import { Injectable } from '@nestjs/common'

import { Role } from '@server/modules/auth/auth.constant'

import { Action, AppAbility, BaseAbility } from '../casl/ability.class'
import { DefineAbility } from '../casl/ability.decorator'

@DefineAbility('Note')
@Injectable()
export class NoteAbility implements BaseAbility {
  createForUser(user: IAuthUser) {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)

    if (user.role === Role.Admin)
      can(Action.Manage, 'Note')

    can(Action.Create, 'Note')
    can(Action.Read, 'Note', { isPublished: true })
    can(Action.Update, 'Note', { userId: user.id })
    can(Action.Delete, 'Note', { userId: user.id })

    return build()
  }
}
