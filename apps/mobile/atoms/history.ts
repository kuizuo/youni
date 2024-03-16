import { atom } from 'jotai'
import { CheckedState } from 'tamagui'

export const historyStateAtoms = {
  isManageMode: atom(false),
  selectAll: atom<CheckedState>(false),
  items: atom<string[]>([]),
  selectedItems: atom<string[]>([]),
}