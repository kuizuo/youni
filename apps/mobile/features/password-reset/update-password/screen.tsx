import { YStack, useToastController } from '@/ui'
import { PasswordResetComponent } from '@/ui/PasswordReset'
import { useAuth } from '@/utils/auth/hooks/useAuth'
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
