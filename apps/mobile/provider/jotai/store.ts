import { createStore } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { clearAll, getItem, removeItem, setItem } from '../kv'

export const jotaiStore = createStore()

export const atomWithMMKV = <T>(key: string, initialValue: T) =>
  atomWithStorage<T>(
    key,
    initialValue,
    createJSONStorage<T>(() => ({
      getItem,
      setItem,
      removeItem,
      clearAll,
    })),
  );