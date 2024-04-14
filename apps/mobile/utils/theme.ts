export const themeVariant = {
  light: 'light',
  dark: 'dark',
  system: 'system',
} as const

export type ThemeVariant = keyof typeof themeVariant

export type CurrentThemeVariant = 'light' | 'dark'
