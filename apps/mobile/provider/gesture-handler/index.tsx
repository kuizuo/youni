import { GestureHandlerRootView } from 'react-native-gesture-handler'

export function GestureHandlerProvider({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {children}
      {' '}
    </GestureHandlerRootView>
  )
}
