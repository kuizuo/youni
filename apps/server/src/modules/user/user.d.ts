import { Role } from '@server/modules/auth/constants'

export type UserProfile = Awaited<
  ReturnType<import('./user.service').UserService['getProfile']>
>

export interface Profile {
  id: string
  username: string
  avatar: string | null
  email: string | null
  nickname: string | null
  role: Role
}
