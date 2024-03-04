import { Dimensions, Platform, ScaledSize } from "react-native";


export const isWeb = Platform.OS === 'web';

export const window: ScaledSize = !isWeb
  ? {
    ...Dimensions.get("window"),
    width: 800,
  }
  : Dimensions.get("window");