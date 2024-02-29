import { ColorScheme, NextThemeProvider, useRootTheme } from '@tamagui/next-theme'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'

export const TamaguiThemeProvider = ({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode => {
  const [theme, setTheme] = useRootTheme()

  return (
    <NextThemeProvider
      onChangeTheme={(next) => {
        setTheme(next as ColorScheme)
      }}
    >
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        {children}
      </ThemeProvider>
    </NextThemeProvider>
  )
}

export { useRootTheme } from '@tamagui/next-theme'
