import { PureAbility } from '@casl/ability'
import { Subjects } from '@casl/prisma'
import { Campus, Collection, Comment, History, Note, Notification, Tag, Todo, User } from '@youni/database'

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

// eslint-disable-next-line ts/consistent-type-definitions
export type PrismaSubjects = {
  User: User
  Todo: Todo
  Note: Note
  Tag: Tag
  Collection: Collection
  History: History
  Comment: Comment
  Notification: Notification
  Campus: Campus
}

export type AppAbility = PureAbility<[Action, Subjects<PrismaSubjects>]>

export abstract class BaseAbility {
  abstract createForUser(user: IAuthUser): AppAbility
}
