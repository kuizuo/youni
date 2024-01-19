import { SetMetadata, applyDecorators } from '@nestjs/common'

import { AllModelNames } from '~/shared/database/prisma.extension'

import { PERMISSION_KEY } from '../auth.constant'

export type PermissionValue<T extends AllModelNames> = `${T}:${string}`

/** 资源操作需要特定的权限 */
export function Perm(permission: PermissionValue<AllModelNames> | PermissionValue<AllModelNames>[]) {
  return applyDecorators(SetMetadata(PERMISSION_KEY, permission))
}
