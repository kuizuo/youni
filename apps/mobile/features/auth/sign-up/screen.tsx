import { useRouter } from 'expo-router'
import { View, useToastController } from '@/ui'
import { SignUpSignInComponent } from '@/features/auth/sign-in/SignUpSignIn'

export function SignUpScreen(): React.ReactNode {
  const { push } = useRouter()
  const toast = useToastController()

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
    <View className="flex-1 justify-center items-center gap-1">
      <SignUpSignInComponent
        type="sign-up"
        handleOAuthWithPress={handleOAuthSignInWithPress}
        handleEmailWithPress={handleEmailSignUpWithPress}
      />
    </View>
  )
}
