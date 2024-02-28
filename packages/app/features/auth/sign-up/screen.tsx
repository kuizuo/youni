import type { Provider } from '@supabase/supabase-js'
import { YStack, useToastController } from '@youni/ui'
import { capitalizeWord } from '@youni/ui/src/libs/string'
import { SignUpSignInComponent } from 'app/features/auth/sign-in/SignUpSignIn'
import { useAuth } from 'app/utils/auth/hooks/useAuth'
import { useRouter } from 'solito/navigation'

export const SignUpScreen = (): React.ReactNode => {
  const { push } = useRouter()
  const toast = useToastController()
  const supabase = useSupabase()

  const handleOAuthSignInWithPress = async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options:
        provider === 'google'
          ? {
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            }
          : {},
    })
    if (error) {
      toast.show(`${capitalizeWord(provider)} sign up failed`, {
        description: error.message,
      })
      return
    }
    push('/')
  }

  const handleEmailSignUpWithPress = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      console.log('error', error)
      toast.show('Sign up failed', {
        message: error.message,
      })
    } else if (data?.user) {
      toast.show('Email Confirmation', {
        message: 'Check your email ',
      })
      push('/')
    }
  }

  return (
    <YStack flex={1} justifyContent='center' alignItems='center' space>
      <SignUpSignInComponent
        type='sign-up'
        handleOAuthWithPress={handleOAuthSignInWithPress}
        handleEmailWithPress={handleEmailSignUpWithPress}
      />
    </YStack>
  )
}
