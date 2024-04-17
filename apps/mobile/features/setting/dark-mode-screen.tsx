import { ListItem, View, ScrollView, YGroup } from '@gluestack-ui/themed'

export function DarkModeSettingScreen() {
  return (
    <View flex={1} bg="$background">
      <ScrollView bg="$gray2">
        <YGroup alignSelf="center" size="$4" mt="$4">
          <YGroup.Item>
            <ListItem pressTheme hoverTheme title="深色模式" />
          </YGroup.Item>
        </YGroup>

      </ScrollView>
    </View>
  )
}
