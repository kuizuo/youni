import { Alert } from 'react-native'

export function confirm(title: string, message?: string) {
  return new Promise((resolve, reject) =>
    Alert.alert(
      title,
      message,
      [
        {
          text: '取消',
          onPress: reject,
          style: 'cancel',
        },
        {
          text: '确定',
          onPress: resolve,
        },
      ],
    ),
  )
}
