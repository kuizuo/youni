import type { Campus } from '@youni/database'
import { atom, useAtom } from 'jotai'
import { atomWithMMKV } from '@/provider/jotai/store'

const currentCampus = atomWithMMKV<Campus | null>('currentCampus', {} as Campus)

export function useCurrentCampus() {
  return [...useAtom(currentCampus)] as const
}
