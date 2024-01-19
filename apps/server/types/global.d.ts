declare global {
  interface IAuthUser {
    uid: string
    pv: number
    exp?: number
    iat?: number
    roles?: string[]
  }

  export interface IListRespData<T = any> {
    items: T[]
  }
}

export {}
