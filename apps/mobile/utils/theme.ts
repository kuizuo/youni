import { useToken } from '@gluestack-ui/themed'
import { useColorScheme } from 'nativewind'

export function useColor() {
  const { colorScheme } = useColorScheme()

  const primaryColor = useToken('colors', 'primary500') as string
  const textColor = useToken('colors', colorScheme === 'dark' ? 'textLight0' : 'textLight700') as string
  const bgColor = useToken('colors', colorScheme === 'dark' ? 'backgroundDark950' : 'backgroundLight100') as string
  const bgMutedColor = useToken('colors', colorScheme === 'dark' ? 'backgroundDarkMuted' : 'backgroundLightMuted') as string
  const borderColor = useToken('colors', colorScheme === 'dark' ? 'borderDark700' : 'borderLight300') as string

  return {
    primaryColor,
    textColor,
    bgColor,
    bgMutedColor,
    borderColor,
  }
}
