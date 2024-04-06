import { atom } from 'jotai'

export const tagSheetOpenAtom = atom(false)
export const selectTagsAtom = atom<string[]>([])
