import { Stack } from 'expo-router'
import { ProfileScreen } from '@/features/user/profile/screen'

export default function Screen() {
  return (
    <>
      <Stack.Screen />
      <ProfileScreen />
    </>
  )
}
