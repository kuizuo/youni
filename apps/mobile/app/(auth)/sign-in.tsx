import { Stack } from 'expo-router'
import { SignInScreen } from '@/features/auth/sign-in/screen'

export default function Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: '登录',
          headerTitleAlign: 'center',
        }}
      />
      <SignInScreen />
    </>
  )
}
