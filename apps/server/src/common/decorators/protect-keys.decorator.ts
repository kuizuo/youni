import { SetMetadata } from '@nestjs/common'

export const OMIT_RESPONSE_PROTECT_KEY = '__omit_response_protect_keys__'
/**
 * @description 过滤响应体中的字段
 */
export const ProtectKeys: (keys: string[]) => MethodDecorator
  = keys => (target, key, descriptor: PropertyDescriptor) => {
    SetMetadata(OMIT_RESPONSE_PROTECT_KEY, keys)(descriptor.value)
  }
