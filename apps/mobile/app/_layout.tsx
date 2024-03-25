import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { Provider } from '@/provider'

import 'react-native-gesture-handler'

if (Platform.OS === 'web') {
  // @ts-expect-error
  import('../global.css')
  // @ts-expect-error
  import('../tamagui-web.css')
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error)
      throw error
  }, [error])

  useEffect(() => {
    if (loaded)
      SplashScreen.hideAsync()
  }, [loaded])

  if (!loaded)
    return null

  return (
    <Provider>
      <Stack screenOptions={{
        headerShown: false,
      }}
      >
      </Stack>

    </Provider>
  )
}
