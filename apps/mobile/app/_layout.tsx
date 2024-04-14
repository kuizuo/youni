import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect } from 'react'
import { useColorScheme } from 'nativewind'
import { Provider } from '@/provider'
import { DrawerContainer } from '@/ui/components/DrawerContainer'

import '../global.css'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { colorScheme } = useColorScheme()

  // const [loaded, error] = useFonts({
  //   Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
  //   InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  // })

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  // useEffect(() => {
  //   if (error)
  //     throw error
  // }, [error])

  // useEffect(() => {
  //   if (loaded)
  //     SplashScreen.hideAsync()
  // }, [loaded])

  // if (!loaded)
  //   return null

  return (
    <Provider>
      <DrawerContainer>
        <Stack screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === 'dark' ? '#151515' : '#FFFFFF',
          },
        }}
        >
        </Stack>
      </DrawerContainer>
    </Provider>
  )
}
