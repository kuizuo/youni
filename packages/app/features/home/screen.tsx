import {
  ScrollView,
  Separator,
  YStack,
} from '@youni/ui'


export function HomeScreen() {
  return (
    <ScrollView>
      <YStack flex={1} jc='center' ai='center' p='$4' space='$4'>
        <Separator />
      </YStack>
    </ScrollView>
  )
}
