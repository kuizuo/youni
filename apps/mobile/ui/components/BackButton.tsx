import { ChevronLeft } from "@tamagui/lucide-icons";
import type { IconProps } from '@tamagui/helpers-icon'
import { useRouter } from "expo-router";

export function BackButton({ onPress, ...props }: IconProps) {
  const router = useRouter()

  return <ChevronLeft
    size={'$1.5'}
    onPress={ev => {
      if (typeof onPress === 'function') {
        onPress(ev)
        return
      }

      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace('/')
      }
    }}
    {...props}
  />
}