import { Center, Text, View } from '@gluestack-ui/themed'
import { NavBar, NavButton } from '@/ui/components/NavBar'

export default () => {
  return (
    <View flex={1}>
      <NavBar left={<NavButton.Back />}>
        <Text flex={1} textAlign="center">创作中心</Text>
      </NavBar>
      <Center><Text>创作中心页面</Text></Center>
    </View>
  )
}
