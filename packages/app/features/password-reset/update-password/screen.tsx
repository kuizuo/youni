import { YStack, useToastController } from '@youni/ui'
import { PasswordResetComponent } from '@youni/ui/src/PasswordReset'
import { useAuth } from 'app/utils/auth/hooks/useAuth'
import { useRouter } from 'solito/navigation'

export function UpdatePasswordScreen() {
  const { push } = useRouter()
  const toast = useToastController()
  const supabase = useSupabase()

  const handlePasswordUpdateWithPress = async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.show('Password change failed', {
        description: error.message,
      })
      console.log('Password change failed', error)
      return
    }
    push('/')
  }

  return (
    <YStack flex={1} justifyContent='center' alignItems='center' space>
      <PasswordResetComponent type='password' handleWithPress={handlePasswordUpdateWithPress} />
    </YStack>
  )
}
