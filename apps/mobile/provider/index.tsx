import { CustomToast, ToastProvider } from '@/ui'
import { AuthProvider } from './auth'
import { SafeAreaProvider } from './safe-area'
import { SolitoImageProvider } from './solito-image'
import { TamaguiProvider } from './tamagui'
import { TamaguiThemeProvider } from './theme'
import { ToastViewport } from './toast-viewport'
import { JotaiProvider } from './jotai'
import { TRPCProvider } from './trpc'
import { GestureHandlerProvider } from './gesture-handler'

export function Provider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TamaguiThemeProvider>
      <TamaguiProvider>
        <SafeAreaProvider>
          <SolitoImageProvider>
            <ToastProvider swipeDirection='horizontal' duration={5000} native={['mobile']}>
              <JotaiProvider>
                <AuthProvider>
                  <TRPCProvider>
                    <GestureHandlerProvider>
                      {children}
                    </GestureHandlerProvider>
                    <CustomToast />
                    <ToastViewport />
                  </TRPCProvider>
                </AuthProvider>
              </JotaiProvider>
            </ToastProvider>
          </SolitoImageProvider>
        </SafeAreaProvider>
      </TamaguiProvider>
    </TamaguiThemeProvider>
  )
}
