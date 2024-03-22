import { View, Text } from "@/ui"
import { isArray } from 'lodash-es'
import { ReactNode, isValidElement } from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Platform } from "react-native"

export const NAV_BAR_HEIGHT = 48

interface Props {
  children?: ReactNode
  left?: ReactNode
  right?: ReactNode
  hideSafeTop?: boolean
}

export function NavBar({
  children,
  hideSafeTop,
  left,
  right,
}: Props) {
  const safeTop = useNavBarSafeTop(hideSafeTop)

  return <View flexDirection="row" position="relative" paddingHorizontal='$2.5' gap={'$1.5'} alignItems="center" paddingTop={safeTop} >
    {left && (
      <View minWidth={'$1.5'} flexDirection="row" justifyContent="flex-start" alignItems="center">
        {left}
      </View>
    )}

    <View flex={1} flexDirection="row" alignItems="center">
      {typeof children === 'string' ? (
        <Text textAlign="center" numberOfLines={1}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>

    {right && (
      <View minWidth={'$1.5'} flexDirection="row" justifyContent="flex-end" alignItems="center">
        {right}
      </View>
    )}
  </View>
}


export function useNavBarHeight(hideSafeTop?: boolean) {
  return useNavBarSafeTop(hideSafeTop) + NAV_BAR_HEIGHT
}


function useNavBarSafeTop(hideSafeTop?: boolean) {
  const safeAreaInsets = useSafeAreaInsets()
  return !hideSafeTop || Platform.OS === 'android' ? safeAreaInsets.top : 0
}
