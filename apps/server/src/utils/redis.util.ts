import type { RedisKeys } from '@server/constants/cache.constant'

type Prefix = 'youni'
export const prefix = 'youni'

export function getRedisKey<T extends string = RedisKeys | '*'>(key: T, ...concatKeys: string[]): `${Prefix}:${T}${string | ''}` {
  return `${prefix}:${key}${
    concatKeys && concatKeys.length ? `:${concatKeys.join('_')}` : ''
  }`
}
