import { Search } from '@tamagui/lucide-icons'
import { Input, View, XStack, YStack } from '@/ui'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'

export function MapScreen() {
  return (
    <YStack fullscreen bg="$background">
      <NavBar left={<NavButton.Back />}>
        位置
      </NavBar>
      <View fd="row" margin="$2" px="$2">
        <XStack
          flex={1}
          ai="center"
          bg="$gray3"
          px="$2.5"
          py="$2.5"
          gap="$2"
          br={50}
        >
          <Search size="$1" />
          <Input placeholder="搜索" textAlignVertical="center" unstyled></Input>
        </XStack>
      </View>

    </YStack>
  )
}
