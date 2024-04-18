import { Divider, ScrollView, View } from '@gluestack-ui/themed'
import { ListGroup } from '@/ui/components/ListGroup'
import { ListItem } from '@/ui/components/ListItem'

export function DarkModeSettingScreen() {
  return (
    <View flex={1} bg="$background">
      <ScrollView bg="$gray2">
        <ListGroup mt="$4" bg="$backgroundLight0" divider={<Divider />}>
          <ListItem
            title="深色模式"
          />
        </ListGroup>
      </ScrollView>
    </View>
  )
}
