import { Search } from 'lucide-react-native'
import { HStack, Input, View, VStack } from '@gluestack-ui/themed'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'

export function MapScreen() {
  return (
    <VStack fullscreen bg="$background">
      <NavBar left={<NavButton.Back />}>
        位置
      </NavBar>
      <View flexDirection="row" margin="$2" px="$2">
        <HStack
          flex={1}
          alignItems="center"
          bg="$gray3"
          px="$2.5"
          py="$2.5"
          gap="$2"
          br={50}
        >
          <Search size="sm" />
          <Input placeholder="搜索" verticalAlign="center" unstyled></Input>
        </HStack>
      </View>

    </VStack>
  )
}
