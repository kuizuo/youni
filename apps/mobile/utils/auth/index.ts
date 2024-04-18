import { atom, useAtom, useStore } from 'jotai'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { UserProfile } from '@server/modules/user/user'
import { useRouter } from 'expo-router'
import type { LoginResult } from '@server/modules/auth/auth.model'
import { client } from '../http/client'
import { getToken, setToken } from './utils'
import { atomWithMMKV } from '@/provider/jotai/store'
import { useCurrentCampus } from '@/atoms/campus'

export interface Credentials {
  username: string
  password: string
}

const userAtom = atomWithMMKV<UserProfile | null>('user', null)
const isLoggedAtom = atomWithMMKV<boolean>('isLogged', false)

export function useAuth() {
  const router = useRouter()

  const store = useStore()
  const [currentCampus, setCurrentCampus] = useCurrentCampus()
  const [isLogged] = useAtom(isLoggedAtom)
  const [user] = useAtom(userAtom)

  const login = async (_data: Credentials) => {
    const { username, password } = _data
    const data = await client.post('/api/auth/login', {
      username,
      password,
      type: 'account',
    }) as LoginResult

    store.set(isLoggedAtom, true)

    setToken(data.authToken)

    // set user info
    const userInfo = await client.get('/api/account/profile') as UserProfile
    store.set(userAtom, userInfo)

    if (userInfo.campusId)
      setCurrentCampus({ id: userInfo?.campusId } as any)

    return data
  }

  // const {
  //   data: currentUser,
  //   isLoading,
  //   isError,
  //   error,
  // } = useQuery({
  //   queryKey: ['profile'],
  //   queryFn: async () => {
  //     const data = await client.get('/api/account/profile') as UserProfile
  //     return data
  //   },
  //   onError: (error) => {
  //     console.error('Failed to fetch user profile:', error)
  //     router.navigate('/login') // 当发生错误时跳转到登录页面
  //   },
  //   enabled: !!getToken(),
  //   staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
  // })

  return {
    isLogged,
    currentUser: user!,
    login: useMutation({
      mutationFn: login,
    }),
  }
}
