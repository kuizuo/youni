import type { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ViewStyle } from 'react-native'
import { Platform } from 'react-native'
import { Text, View } from '@/ui'

export const NAV_BAR_HEIGHT = 48

interface Props {
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
    <View
      position="relative"
      fd="row"
      px="$2.5"
      gap="$2"
      pt={safeTop || '$2.5'}
      pb="$2.5"
      ai="center"
      style={style}
    >
      {left && (
        <View minWidth="$1.5" fd="row" jc="flex-start" ai="center">
          {left}
        </View>
      )}

      <View flex={1} fd="row" ai="center">
        {typeof children === 'string'
          ? (
            <Text textAlign="center" numberOfLines={1}>
              {children}
            </Text>
            )
          : (
              children
            )}
      </View>

      {right && (
        <View minWidth="$1.5" fd="row" jc="flex-end" ai="center">
          {right}
        </View>
      )}
    </View>
  )
}

export function useNavBarHeight(hideSafeTop?: boolean) {
  return useNavBarSafeTop(hideSafeTop) + NAV_BAR_HEIGHT
}

function useNavBarSafeTop(hideSafeTop?: boolean) {
  const safeAreaInsets = useSafeAreaInsets()
  return !hideSafeTop || Platform.OS === 'android' ? safeAreaInsets.top : 0
}
