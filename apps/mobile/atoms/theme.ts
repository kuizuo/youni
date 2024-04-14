import { atom, useAtom } from 'jotai'
import { Appearance } from 'react-native'
import { storage } from '@/provider/kv'
import { themeVariant } from '@/utils/theme'
import type { CurrentThemeVariant, ThemeVariant } from '@/utils/theme'

export const appThemeKey = 'appTheme'

const appThemeAtom = atom<ThemeVariant>(storage.getString(appThemeKey) as ThemeVariant)

export function useAppTheme() {
  return [...useAtom(appThemeAtom)] as const
}

const currentThemeAtom = atom<CurrentThemeVariant>((get) => {
  const userTheme = get(appThemeAtom)
  if (userTheme === themeVariant.system)
    return Appearance.getColorScheme() as CurrentThemeVariant

  return userTheme
})

export function useCurrentTheme() {
  return [...useAtom(currentThemeAtom)] as const
}
