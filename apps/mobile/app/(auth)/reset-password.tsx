import { ResetPasswordScreen } from 'app/features/auth/reset-password/screen'
import { Stack } from 'expo-router'

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
