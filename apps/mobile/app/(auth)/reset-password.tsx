import { Stack } from 'expo-router'
import { ResetPasswordScreen } from '@/features/auth/reset-password/screen'

export default function Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Reset Password',
        }}
      />
      <ResetPasswordScreen />
    </>
  )
}
