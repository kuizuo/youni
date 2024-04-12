import { useRouter } from 'expo-router'
import { View, useToastController } from '@/ui'
import { capitalizeWord } from '@/ui/libs/string'
import { SignUpSignInComponent } from '@/features/auth/sign-in/SignUpSignIn'
import { useAuth } from '@/utils/auth/hooks/useAuth'
import tw from '@/utils/tw'

export function SignInScreen(): React.ReactNode {
  const router = useRouter()
  const { signInWithPassword } = useAuth()

  const toast = useToastController()

  const handleOAuthSignInWithPress = async (provider: 'wechat' | 'google' | 'apple') => {
    // const { error } = await supabase.auth.signInWithOAuth({
    //   provider: provider,
    //   options: {
    //     scopes:
    //       provider === 'google'
    //         ? 'https://www.googleapis.com/auth/userinfo.email, https://www.googleapis.com/auth/userinfo.profile'
    //         : 'read:user user:email',
    //   },
    // })

    // if (error) {
    //   toast.show(`${capitalizeWord(provider)} sign in failed`, {
    //     description: error.message,
    //   })
    //   console.log('OAuth Sign in failed', error)
    //   return
    // }

    toast.show(`${capitalizeWord(provider)} 登录失败`, {
      message: '未实现',
    })
    // router.replace('/')
  }

  const handleEmailSignInWithPress = async (username: string, password: string) => {
    const { error } = await signInWithPassword({
      username,
      password,
    })

    if (error) {
      toast.show('登录失败', {
        message: error.message,
      })
      return
    }

    router.replace('/')
  }

  return (
    <View style={tw`flex-1 justify-center items-center gap-4`}>
      <SignUpSignInComponent
        type="sign-in"
        handleOAuthWithPress={handleOAuthSignInWithPress}
        handleEmailWithPress={handleEmailSignInWithPress}
      />
    </View>
  )
}
