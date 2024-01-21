export type UserProfile = Awaited<
  ReturnType<import('./user.service').UserService['getProfile']>
>

export interface Profile {
  id: string
  username: string
  avatar: string | null
  email: string | null
  nickname: string | null
  roles: {
    id: string
    name: string
    value: string
  }[]
}
