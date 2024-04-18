import { Text, View } from '@gluestack-ui/themed'
import { Stack } from 'expo-router'

export function ScheduleScreen() {
  return (
    <View flex={1}>
      <Stack.Screen options={{
        headerTitle: '课程表',
        headerShown: true,
      }}
      />
      <Text textAlign="center">待实现...</Text>
    </View>
  )
}
