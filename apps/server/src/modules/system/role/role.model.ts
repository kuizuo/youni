export class RoleInfo {
  name: string

  value: string

  remark: string

  status: number

  default: boolean

  menuIds: number[]

  constructor(partial?: Partial<RoleInfo>) {
    Object.assign(this, partial)
  }
}
