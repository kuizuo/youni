import { client } from "@/utils/http/client"
import { useQuery } from "@tanstack/react-query"
import { UserProfile } from '@server/modules/user/user'

export const useUser = () => {
  const {
    data: profile,
    isLoading: isLoadingProfile,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await client.get('/api/account/profile')

      return data as UserProfile
    },
  })

  return {
    profile,
    isLoadingProfile,
    updateProfile: () => refetch(),
  }
}
