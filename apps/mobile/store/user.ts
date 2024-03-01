import { UserProfile } from '@server/modules/user/user'
import { atomWithMMKV, jotaiStore } from '@/provider/jotai/store'
import { useQuery } from '@tanstack/react-query'
import { client } from '@/utils/http/client'
import { useEffect } from 'react'
import { useAtom } from 'jotai'

export const userAtom = atomWithMMKV<UserProfile | null>('userProfile', null)

export const useUserStore = () => {
  const [user] = useAtom(userAtom)

  return user
}

export const useUser = () => {
  // FIXME: Uncaught Error: No QueryClient set, use QueryClientProvider to set one
  const {
    data: profile,
    isLoading: isLoadingProfile,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await client.get('/api/account/profile')

      return data.data as UserProfile
    },
  })

  return {
    profile: profile,
    // updateProfile: () => refetch(),
  }
}
