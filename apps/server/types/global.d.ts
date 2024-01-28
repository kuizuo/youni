import { Role } from '~/modules/auth/auth.constant'

declare global {
  interface IAuthUser {
    uid: string
    role: Role
    exp?: number
    iat?: number
  }

  export interface IListRespData<T = any> {
    items: T[]
  }
}

export {}
