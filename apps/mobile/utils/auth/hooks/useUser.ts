import { useQuery } from '@tanstack/react-query'
import type { UserProfile } from '@server/modules/user/user'
import { useRouter } from 'expo-router'
import { client } from '@/utils/http/client'

export function useUser() {
  const router = useRouter()

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await client.get('/api/account/profile')

      return data as UserProfile
    },
  })

  const logOut = async () => {
    await client.post('/api/account/logout')
  }

  return {
    currentUser: data,
    isLoading,
    isSignined: !!data,
    logOut,
  }
}
