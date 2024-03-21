import { atom, useAtom } from 'jotai'

export const drawerOpenAtom = atom(false)

export function useDrawerOpen() {
  return [...useAtom(drawerOpenAtom)] as const
}