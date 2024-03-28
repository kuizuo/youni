import { useRouter } from 'expo-router'
import { Search } from '@tamagui/lucide-icons'
import { Input, View, XStack } from '@/ui'

export function SearchBar({
  palceholder,
}: {
  palceholder?: string
}): React.ReactNode {
  const router = useRouter()

  return (
    <View flex={1} fd="row" margin="$2" px="$2">
      <XStack
        flex={1}
        ai="center"
        bg="$gray3"
        px="$2.5"
        py="$1.5"
        br={50}
        onPress={() => router.push('/search')}
      >
        <Search size="$1" />
        <Input placeholder={palceholder} textAlignVertical="center" unstyled></Input>
      </XStack>
    </View>
  )
}
