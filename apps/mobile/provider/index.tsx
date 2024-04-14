import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { AuthProvider } from './auth'
import { SafeAreaProvider } from './safe-area'

// import { TamaguiProvider } from './tamagui'
import { ThemeProvider } from './theme'
import { JotaiProvider } from './jotai'
import { TRPCProvider } from './trpc'
import { GluestackUIProvider } from './gluestack-ui'

// import { ToastProvider } from '@/ui'
// import { CustomToast } from '@/ui/components/CustomToast'
// import { ToastViewport } from './toast-viewport'

export function Provider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider>
        <ThemeProvider>
          <SafeAreaProvider>
            <ActionSheetProvider>
              {/* <ToastProvider swipeDirection="horizontal" duration={5000} native={['mobile']}> */}
              <JotaiProvider>
                <AuthProvider>
                  <TRPCProvider>{children}</TRPCProvider>
                  {/* <CustomToast /> */}
                  {/* <ToastViewport /> */}
                </AuthProvider>
              </JotaiProvider>
              {/* </ToastProvider> */}
            </ActionSheetProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  )
}
