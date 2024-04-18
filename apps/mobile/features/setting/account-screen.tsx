import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Button, ButtonText, Divider, ScrollView, View } from '@gluestack-ui/themed'
import { ListItem } from '@/ui/components/ListItem'

export function AccountSettingScreen() {
  const router = useRouter()
  const { bottom } = useSafeAreaInsets()

  return (
    <View flex={1}>
      <ScrollView bg="$gray2">
        <View mt="$4" bg="$backgroundLight0">
          <ListItem
            title="手机号"
          />
          <ListItem
            title="微信账号"
            onPress={() => router.push('/setting/dark-mode')}
          />
        </View>

        <View mt="$4" bg="$backgroundLight0">
          <Button bg="$backgroundLight0">
            <ButtonText color="$textColor0">注销账号</ButtonText>
          </Button>
        </View>

      </ScrollView>

    </View>
  )
}
