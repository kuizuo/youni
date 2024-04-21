import { useToken } from '@gluestack-ui/themed'
import { useColorScheme } from 'nativewind'

export function useColor() {
  const { colorScheme } = useColorScheme()

  const primaryColor = useToken('colors', 'primary500') as string
  const textColor = useToken('colors', colorScheme === 'dark' ? 'textDark700' : 'textLight700') as string
  const bgColor = useToken('colors', colorScheme === 'dark' ? 'backgroundDark950' : 'backgroundLight100') as string
  const borderColor = useToken('colors', colorScheme === 'dark' ? 'borderDark300' : 'backgroundLight300') as string

  return {
    primaryColor,
    textColor,
    bgColor,
    borderColor,
  }
}
