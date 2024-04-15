import type { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ViewStyle } from 'react-native'
import { Platform } from 'react-native'
import { Text, View } from '@gluestack-ui/themed'

// import { Text, View } from '@/ui'

export const NAV_BAR_HEIGHT = 48

interface Props {
  className: string
  children?: ReactNode
  left?: ReactNode
  right?: ReactNode
  hideSafeTop?: boolean
  style?: ViewStyle
}

export function NavBar({
  className,
  children,
  hideSafeTop,
  left,
  right,
  style,
}: Props) {
  const safeTop = useNavBarSafeTop(hideSafeTop)

  return (
    <View
      // className={`${className} relative flex-row items-center px-2 gap-2 pb-2.5`}
      style={{
        paddingTop: safeTop || 8,
        ...style,
      }}
    >
      {left && (
        <View className="min-w-2 flex-row justify-start items-center">
          {left}
        </View>
      )}

      <View className="flex-1 flex-row items-center">
        {typeof children === 'string'
          ? (
            <Text className="text-center" numberOfLines={1}>
              {children}
            </Text>
            )
          : (
              children
            )}
      </View>

      {right && (
        <View className="min-w-2 flex-row justify-start items-center">
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
