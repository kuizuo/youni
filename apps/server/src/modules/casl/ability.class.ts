import { PureAbility } from '@casl/ability'
import { Subjects } from '@casl/prisma'
import { Post, Todo, User } from '@youni/prisma'

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

// eslint-disable-next-line ts/consistent-type-definitions
export type PrismaSubjects = {
  Todo: Todo
  Post: Post
  User: User
}

export type AppAbility = PureAbility<[Action, Subjects<PrismaSubjects>]>

export abstract class BaseAbility {
  abstract createForUser(user: IAuthUser): AppAbility
}