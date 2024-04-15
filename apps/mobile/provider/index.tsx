import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
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
              <JotaiProvider>
                <TRPCProvider>{children}</TRPCProvider>
              </JotaiProvider>
            </ActionSheetProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  )
}
