import type { Provider } from '@supabase/supabase-js'
import { YStack, useToastController } from '@youni/ui'
import { capitalizeWord } from '@youni/ui/src/libs/string'
import { SignUpSignInComponent } from 'app/features/auth/sign-in/SignUpSignIn'
import { useAuth } from 'app/utils/auth/hooks/useAuth'
import { useRouter } from 'solito/navigation'

export const SignInScreen = (): React.ReactNode => {
  const { replace } = useRouter()
  const { signInWithPassword } = useAuth()
  const toast = useToastController()

  const handleOAuthSignInWithPress = async (provider: Provider) => {
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

    replace('/')
  }

  const handleEmailSignInWithPress = async (email: string, password: string) => {
    const { error } = await signInWithPassword({
      email: email,
      password: password,
    })
    if (error) {
      toast.show('Sign in failed', {
        description: error.message,
      })
      return
    }

    replace('/')
  }

  return (
    <YStack flex={1} justifyContent='center' alignItems='center' space>
      <SignUpSignInComponent
        type='sign-in'
        handleOAuthWithPress={handleOAuthSignInWithPress}
        handleEmailWithPress={handleEmailSignInWithPress}
      />
    </YStack>
  )
}
