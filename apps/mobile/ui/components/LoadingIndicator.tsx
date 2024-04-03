import * as React from 'react'
import type { ActivityIndicatorProps, ViewStyle } from 'react-native'
import { ActivityIndicator, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export function LoadingIndicator({
  style,
  size = Platform.OS === 'ios' ? 'small' : 'large',
}: {
  style?: ViewStyle
  size?: ActivityIndicatorProps['size']
}) {
  return (
    <SafeAreaView
      edges={['bottom']}
      style={style}
    >
      <ActivityIndicator size={size} />
    </SafeAreaView>
  )
}
