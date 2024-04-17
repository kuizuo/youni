import { View } from '@gluestack-ui/themed'

export function GestureHandlerProvider({ children }: { children: React.ReactNode }): React.ReactNode {
  return <View style={{ flex: 1 }}>{children}</View>
}
