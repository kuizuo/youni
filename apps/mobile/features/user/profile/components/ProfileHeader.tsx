import { XStack, Button } from "@/ui"
import { ChevronLeft, ArrowUpRightFromSquare, Menu } from "@tamagui/lucide-icons"
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export const ProfileHeader = ({ showGobackButton }: { showGobackButton: boolean }) => {
  const { top } = useSafeAreaInsets()

  return <>
    <XStack paddingTop={top} marginHorizontal="$3" marginBottom='$3' justifyContent="space-between">
      {showGobackButton
        ? <Button size={'$1'} color={'white'} icon={<ChevronLeft size={'$1'} />} unstyled onPress={() => router.back()} />
        : <Button size={'$1'} color={'white'} icon={<Menu size={'$1'} />} unstyled />
      }

      <Button size={'$1'} color={'white'} icon={<ArrowUpRightFromSquare size={'$1'} />} unstyled></Button>
    </XStack>
  </>
}