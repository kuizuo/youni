import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect } from 'react'
import { useAppColorScheme, useDeviceContext } from 'twrnc'
import { Provider } from '@/provider'
import { DrawerContainer } from '@/ui/components/DrawerContainer'

import tw from '@/utils/tw'

import '../global.css'

// if (Platform.OS === 'web') {
//   // @ts-expect-error
//   import('../tamagui-web.css')
// }

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useDeviceContext(tw, {
    observeDeviceColorSchemeChanges: false,
    initialColorScheme: 'device',
  })

  const [colorScheme, toggleColorScheme, setColorScheme] = useAppColorScheme(tw)

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
