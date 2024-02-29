import { client } from '@/utils/http/client'
import { useQuery } from '@tanstack/react-query'

export const useUser = () => {
  // const {
  //   data: profile,
  //   isLoading: isLoadingProfile,
  //   refetch,
  // } = useQuery({
  //   queryKey: ['profile'],
  //   queryFn: async () => {
  //     const { data } = await client.get('/api/account/profile')

  //     return data.data
  //   }
  // })

  return {
    profile: { avatar: '' },
    // updateProfile: () => refetch(),
  }
}
