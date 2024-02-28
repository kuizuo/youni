import { YStack, useToastController } from '@youni/ui'
import { PasswordResetComponent } from '@youni/ui/src/PasswordReset'
import { useAuth } from 'app/utils/auth/hooks/useAuth'
import { useRouter } from 'solito/navigation'

export function PasswordResetScreen() {
  const { push } = useRouter()
  const toast = useToastController()
  const {} = useAuth()

  const handleEmailWithPress = async (email) => {
    // Send email with the password reset link
    // const { error } = await supabase.auth.resetPasswordForEmail(email)
    // if (error) {
    //   toast.show('Password reset request failed', {
    //     description: error.message,
    //   })
    //   console.log('Password reset request failed', error)
    //   return
    // }

    push('/')
  }

  return (
    <YStack flex={1} justifyContent='center' alignItems='center' space>
      <PasswordResetComponent type='email' handleWithPress={handleEmailWithPress} />
    </YStack>
  )
}
