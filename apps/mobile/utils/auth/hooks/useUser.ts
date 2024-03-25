import { client } from "@/utils/http/client"
import { useQuery } from "@tanstack/react-query"
import { UserProfile } from '@server/modules/user/user'
import { useRouter } from "expo-router"

export const useUser = () => {
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

  if (!isLoading && !data) {
    router.replace('/sign-in')
  }

  const logOut = async () => {
    await client.post('/api/account/logout')
  }

  return {
    currentUser: data,
    isLoading,
    logOut,
  }
}