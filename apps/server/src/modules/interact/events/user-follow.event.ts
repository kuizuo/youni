export class UserFollowEvent {
  targetId: string
  userId: string

  public constructor(partial?: Partial<UserFollowEvent>) {
    Object.assign(this, partial)
  }
}
