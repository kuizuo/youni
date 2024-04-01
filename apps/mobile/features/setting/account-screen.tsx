import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ListItem, ScrollView, Separator, View, YGroup } from '@/ui'

export function AccountSettingScreen() {
  const router = useRouter()
  const { bottom } = useSafeAreaInsets()

  return (
    <View flex={1} bg="$background">

      <ScrollView bg="$gray2">
        <YGroup alignSelf="center" size="$4" mt="$4" separator={<Separator />}>
          <YGroup.Item>
            <ListItem pressTheme hoverTheme title="手机号" />
          </YGroup.Item>
        </YGroup>

        <YGroup alignSelf="center" size="$4" mt="$4" separator={<Separator />}>
          <YGroup.Item>
            <ListItem pressTheme hoverTheme title="微信账号" />
          </YGroup.Item>
        </YGroup>

        <YGroup alignSelf="center" size="$4" mt="$4" separator={<Separator />}>
          <YGroup.Item>
            <ListItem pressTheme hoverTheme title="注销账号" />
          </YGroup.Item>
        </YGroup>

      </ScrollView>

    </View>
  )
}
