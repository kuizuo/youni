import { Stack } from 'expo-router'
import { FollowerScreen } from '@/features/user/follower/screen'

export default function Screen() {
  return (
    <>
      <Stack.Screen />
      <FollowerScreen />
    </>
  )
}
