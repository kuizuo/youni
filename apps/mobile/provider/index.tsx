import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { AuthProvider } from './auth'
import { SafeAreaProvider } from './safe-area'
import { SolitoImageProvider } from './solito-image'
import { TamaguiProvider } from './tamagui'
import { TamaguiThemeProvider } from './theme'
import { ToastViewport } from './toast-viewport'
import { JotaiProvider } from './jotai'
import { TRPCProvider } from './trpc'
import { CustomToast, ToastProvider } from '@/ui'

export function Provider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiThemeProvider>
        <TamaguiProvider>
          <SafeAreaProvider>
            <ActionSheetProvider>

              <SolitoImageProvider>
                <ToastProvider swipeDirection="horizontal" duration={5000} native={['mobile']}>
                  <JotaiProvider>
                    <AuthProvider>
                      <TRPCProvider>{children}</TRPCProvider>
                      <CustomToast />
                      <ToastViewport />
                    </AuthProvider>
                  </JotaiProvider>
                </ToastProvider>
              </SolitoImageProvider>
            </ActionSheetProvider>

          </SafeAreaProvider>
        </TamaguiProvider>
      </TamaguiThemeProvider>
    </GestureHandlerRootView>
  )
}
