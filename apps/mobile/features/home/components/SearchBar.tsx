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
    <View flex={1} flexDirection="row" margin="$2" paddingHorizontal="$2">
      <XStack
        flex={1}
        alignItems="center"
        backgroundColor="$gray3"
        paddingHorizontal="$2.5"
        paddingVertical="$1.5"
        borderRadius={50}
        onPress={() => router.push('/search')}
      >
        <Search size="$1.5" />
        <Input placeholder={palceholder} textAlignVertical="center" unstyled></Input>
      </XStack>
    </View>
  )
}
