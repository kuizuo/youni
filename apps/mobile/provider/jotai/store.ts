import { createStore } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { clearAll, getItem, removeItem, setItem } from '../kv'

export const jotaiStore = createStore()

export function atomWithMMKV<T>(key: string, initialValue: T) {
  return atomWithStorage<T>(
    key,
    initialValue,
    createJSONStorage<T>(() => ({
      getItem,
      setItem,
      removeItem,
      clearAll,
    })),
  )
}
