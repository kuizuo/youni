import { useFonts } from 'expo-font';
import { Stack, SplashScreen } from 'expo-router';
import {  useEffect } from 'react';
import {
  SafeAreaProvider  ,
} from 'react-native-safe-area-context'
import { Platform } from "react-native";

if (Platform.OS === "web") {
  import("../tamagui-web.css");
}

import { Provider } from '@/provider'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <Provider>
      <Stack screenOptions={{
        headerShown: false,
      }}>
      </Stack>
    </Provider>
  )
}