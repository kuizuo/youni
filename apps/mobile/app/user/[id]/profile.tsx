import { UserProfileScreen } from '@/features/user/profile'
import { Stack } from 'expo-router'

export default function Screen() {
  return (
    <>
      <Stack.Screen />
      <UserProfileScreen />
    </>
  )
}