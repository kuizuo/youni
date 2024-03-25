import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key)
  return value ? JSON.parse(value) : null
}

export function setItem<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value))
}

export async function removeItem(key: string) {
  storage.delete(key)
}

export function clearAll(): void {
  storage.clearAll()
}
