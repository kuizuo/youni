import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useColorScheme } from 'nativewind'

export function TamaguiThemeProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode {
  const { colorScheme } = useColorScheme()
  return (
    <ThemeProvider
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      {children}
    </ThemeProvider>
  )
}
