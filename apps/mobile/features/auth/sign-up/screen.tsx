import { useRouter } from 'expo-router'
import { YStack, useToastController } from '@/ui'
import { SignUpSignInComponent } from '@/features/auth/sign-in/SignUpSignIn'
import { useAuth } from '@/utils/auth/hooks/useAuth'

export function SignUpScreen(): React.ReactNode {
  const { push } = useRouter()
  const toast = useToastController()
  const {} = useAuth()

  const handleOAuthSignInWithPress = async (provider: 'wechat' | 'google' | 'apple') => {
    // const { error } = await supabase.auth.signInWithOAuth({
    //   provider: provider,
    //   options:
    //     provider === 'google'
    //       ? {
    //           queryParams: {
    //             access_type: 'offline',
    //             prompt: 'consent',
    //           },
    //         }
    //       : {},
    // })
    // if (error) {
    //   toast.show(`${capitalizeWord(provider)} sign up failed`, {
    //     description: error.message,
    //   })
    //   return
    // }
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
    }
    else if (data?.user) {
      toast.show('Email Confirmation', {
        message: 'Check your email ',
      })
      push('/')
    }
  }

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" space>
      <SignUpSignInComponent
        type="sign-up"
        handleOAuthWithPress={handleOAuthSignInWithPress}
        handleEmailWithPress={handleEmailSignUpWithPress}
      />
    </YStack>
  )
}
