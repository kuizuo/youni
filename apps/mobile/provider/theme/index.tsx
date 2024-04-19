import { View } from '@gluestack-ui/themed'
import { DarkTheme, DefaultTheme, ThemeProvider as ThemeProviderOg } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'nativewind'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme()

  const themeValue = colorScheme === 'dark' ? DarkTheme : DefaultTheme

  return (
    <ThemeProviderOg value={themeValue}>
      <StatusBar style="auto" />
      {children}
    </ThemeProviderOg>
  )
}
