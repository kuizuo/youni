import { Stack } from 'expo-router'
import { SignUpScreen } from '@/features/auth/sign-up/screen'

export default function Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: '注册',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        }}
      />
      <SignUpScreen />
    </>
  )
}
