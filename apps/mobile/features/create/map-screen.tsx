import { Search } from 'lucide-react-native'
import { HStack, Input, MyView, VStack } from '@/ui'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'

export function MapScreen() {
  return (
    <VStack fullscreen bg="$background">
      <NavBar left={<NavButton.Back />}>
        位置
      </NavBar>
      <View fd="row" margin="$2" px="$2">
        <HStack
          flex={1}
          ai="center"
          bg="$gray3"
          px="$2.5"
          py="$2.5"
          gap="$2"
          br={50}
        >
          <Search size="sm" />
          <Input placeholder="搜索" textAlignVertical="center" unstyled></Input>
        </HStack>
      </View>

    </VStack>
  )
}
