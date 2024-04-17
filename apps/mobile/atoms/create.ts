import { atom, useAtom } from 'jotai'

export const selectTagsAtom = atom<string[]>([])

export function useTags() {
  return [...useAtom(selectTagsAtom)] as const
}
