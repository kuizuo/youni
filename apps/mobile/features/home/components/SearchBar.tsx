import { useRouter } from 'expo-router'
import { View, XStack } from '@/ui'
import { Search } from '@tamagui/lucide-icons'

export const SearchBar = (): React.ReactNode => {
  const router = useRouter()

  return <View flexDirection='row' margin="$2" paddingHorizontal='$2'>
    <XStack flex={1} alignItems='center' backgroundColor={'$gray3'} paddingHorizontal='$2.5' paddingVertical='$1.5' borderRadius={50}
      onPress={() => router.push('/search')}
    >
      <Search size='$1.5' />
      <View></View>
    </XStack>
  </View>
}