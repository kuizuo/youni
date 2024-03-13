import { client } from "@/utils/http/client"
import { useQuery } from "@tanstack/react-query"
import { UserProfile } from '@server/modules/user/user'
import { useRouter } from "expo-router"

export const useUser = () => {
  const router = useRouter()

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

  if (!isLoadingProfile && !profile) {
    debugger
    router.replace('/sign-in')
  }

  return {
    profile,
    isLoadingProfile,
    updateProfile: () => refetch(),
  }
}
