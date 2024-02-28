// import { ColorScheme, NextThemeProvider, useRootTheme } from '@tamagui/next-theme'

// export const TamaguiThemeProvider = ({
//   children,
// }: {
//   children: React.ReactNode
// }): React.ReactNode => {
//   const [_, setTheme] = useRootTheme()

//   return (
//     <NextThemeProvider
//       onChangeTheme={(next) => {
//         setTheme(next as ColorScheme)
//       }}
//     >
//       {children}
//     </NextThemeProvider>
//   )
// }

export { useRootTheme } from '@tamagui/next-theme'

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useColorScheme } from 'react-native'

export const TamaguiThemeProvider = ({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode => {
  const colorScheme = useColorScheme() 

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {children}
    </ThemeProvider>
  )
}
