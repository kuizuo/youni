import { YStack, useToastController } from '@/ui'
import { capitalizeWord } from '@/ui/libs/string'
import { SignUpSignInComponent } from '@/features/auth/sign-in/SignUpSignIn'
import { useAuth } from '@/utils/auth/hooks/useAuth'
import { getInitialURL } from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import { useRouter } from 'expo-router'

export const SignInScreen = (): React.ReactNode => {
  const { replace } = useRouter()
  const { signInWithPassword } = useAuth()
  
  const toast = useToastController()
  // const signInWithApple = async () => {
  //   try {
  //     const { token, nonce } = await initiateAppleSignIn()
  //     const { error } = await supabase.auth.signInWithIdToken({
  //       provider: 'apple',
  //       token,
  //       nonce,
  //     })
  //     if (error) {
  //       return toast.show('Authentication Error', {
  //         description: error.message,
  //       })
  //     } else {
  //       replace('/')
  //     }
  //   } catch (e) {
  //     if (typeof e === 'object' && !!e && 'code' in e) {
  //       if (e.code === 'ERR_REQUEST_CANCELED') {
  //         toast.show('Canceled')
  //       } else {
  //         toast.show('Error')
  //         // handle other errors
  //       }
  //     } else {
  //       console.error('Unexpected error from Apple SignIn: ', e)
  //     }
  //   }
  // }

  const handleOAuthWithWeb = async (provider: 'wechat' | 'google' | 'apple') => {
    
  }

  const handleOAuthSignInWithPress = async (provider: 'wechat' | 'google' | 'apple') => {
    if (provider === 'apple' && Platform.OS === 'ios') {
      // use native sign in with apple in ios
      // await signInWithApple()
    } else {
      // use web sign in with other providers
      await handleOAuthWithWeb(provider)
    }
  }

  const handleEmailSignInWithPress = async (email: string, password: string) => {
    const { error } = await signInWithPassword({
      username: email,
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
    <YStack flex={1} justifyContent='center' alignItems='center' gap='$4'>
      <SignUpSignInComponent
        type='sign-in'
        handleOAuthWithPress={handleOAuthSignInWithPress}
        handleEmailWithPress={handleEmailSignInWithPress}
      />
    </YStack>
  )
}
