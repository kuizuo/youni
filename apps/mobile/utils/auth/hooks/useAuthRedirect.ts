import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Platform } from 'react-native'
import { useAuth } from './useAuth'

export function useAuthRedirect() {
  const router = useRouter()
  const { token } = useAuth()

  useEffect(() => {
    if (!token) {
      if (Platform.OS === 'web') {
        setImmediate(() => {
          router.replace('/sign-in')
        })
      }
      else {
        setTimeout(() => {
          router.replace('/sign-in')
        }, 1)
      }
    }
  }, [token])
}
