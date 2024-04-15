import type { ScaledSize } from 'react-native'
import { Dimensions, Platform } from 'react-native'

export const isWeb = Platform.OS === 'web'

export const window: ScaledSize = !isWeb
  ? {
      ...Dimensions.get('window'),
      width: 800,
    }
  : Dimensions.get('window')
