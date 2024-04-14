import { getInitialURL } from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { View, useToastController } from '@/ui'
import { capitalizeWord } from '@/ui/libs/string'
import { SignUpSignInComponent } from '@/features/auth/sign-in/SignUpSignIn'
import { useAuth } from '@/utils/auth/hooks/useAuth'

export function SignUpScreen(): React.ReactNode {
  const { replace } = useRouter()
  const toast = useToastController()
  const supabase = useAuth()

  const handleOAuthWithWeb = async (provider: any) => {
    try {
      const redirectUri = (await getInitialURL()) || 't4://'
      const response = await WebBrowser.openAuthSessionAsync(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectUri}`,
        redirectUri,
      )
      if (response.type === 'success') {
        const url = response.url
        const params = new URLSearchParams(url.split('#')[1])
        const accessToken = params.get('access_token') || ''
        const refreshToken = params.get('refresh_token') || ''
        await supabase.auth
          .setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          .then(({ data: { session }, error }) => {
            if (session) {
              // @ts-expect-error set session does not call subscribers when session is updated
              supabase.auth._notifyAllSubscribers('SIGNED_IN', session)
              replace('/')
            }
            else {
              toast.show(`${capitalizeWord(provider)} sign in failed`, {
                description: error?.message || 'Something went wrong, please try again.',
              })
              console.log('Supabase session error:', error)
            }
          })
      }
    }
    catch (error) {
      toast.show(`${capitalizeWord(provider)} sign in failed`, {
        description: 'Something went wrong, please try again.',
      })
    }
    finally {
      WebBrowser.maybeCompleteAuthSession()
    }
  }

  const handleOAuthSignInWithPress = async (provider: Provider) => {
    if (provider === 'apple' && Platform.OS === 'ios') {
      // use native sign in with apple in ios
      // await signInWithApple()
    }
    else {
      // use web sign in with other providers
      await handleOAuthWithWeb(provider)
    }
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
      replace('/')
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
