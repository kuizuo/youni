import { atomWithMMKV } from '@/provider/jotai/store'

export const searchHistoryAtom = atomWithMMKV<string[]>(
  'searchHistory',
  [],
)
