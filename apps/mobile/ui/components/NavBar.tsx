import type { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ViewStyle } from 'react-native'
import { Platform } from 'react-native'
import { HStack, Text, View } from '@gluestack-ui/themed'

export { NavButton } from './NavButton'

export const NAV_BAR_HEIGHT = 48

interface Props {
  className?: string
  children?: ReactNode
  left?: ReactNode
  right?: ReactNode
  hideSafeTop?: boolean
  style?: ViewStyle
}

export function NavBar({
  children,
  hideSafeTop,
  left,
  right,
  style,
}: Props) {
  const safeTop = useNavBarSafeTop(hideSafeTop)

  return (
    <HStack
      position="relative"
      px="$3"
      py="$2"
      alignItems="center"
      gap="$2.5"
      style={{
        paddingTop: safeTop || 0,
        ...style,
      }}
    >
      {left && (
        <HStack minWidth="$5" justifyContent="flex-start" alignContent="center">
          {left}
        </HStack>
      )}

      <HStack flex={1} alignContent="center">
        {typeof children === 'string'
          ? (
            <Text textAlign="center" numberOfLines={1}>
              {children}
            </Text>
            )
          : (
              children
            )}
      </HStack>

      {right && (
        <HStack minWidth="$5" justifyContent="flex-end" alignContent="center">
          {right}
        </HStack>
      )}
    </HStack>
  )
}

export function useNavBarHeight(hideSafeTop?: boolean) {
  return useNavBarSafeTop(hideSafeTop) + NAV_BAR_HEIGHT
}

function useNavBarSafeTop(hideSafeTop?: boolean) {
  const safeAreaInsets = useSafeAreaInsets()
  return !hideSafeTop || Platform.OS === 'android' ? safeAreaInsets.top : 0
}
