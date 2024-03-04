import { View } from "@/ui"

export const GestureHandlerProvider = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  return <View style={{ flex: 1 }}>{children}</View>
}