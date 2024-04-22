import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import Toast from 'react-native-toast-message'
import { SafeAreaProvider } from './safe-area'
import { ThemeProvider } from './theme'
import { JotaiProvider } from './jotai'
import { TRPCProvider } from './trpc'
import { GluestackUIProvider } from './gluestack-ui'

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <ActionSheetProvider>
              <BottomSheetModalProvider>
                <JotaiProvider>
                  <TRPCProvider>{children}</TRPCProvider>
                  <Toast />
                </JotaiProvider>
              </BottomSheetModalProvider>
            </ActionSheetProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  )
}
