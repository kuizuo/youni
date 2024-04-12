import { router } from 'expo-router'
import type { LoginResult } from '@server/modules/auth/auth.model'
import type { Credentials } from '../hooks/useAuth'
import { AuthContext } from '../hooks/useAuth'
import { getToken, removeToken, setToken } from '../util'
import { client } from '@/utils/http/client'

export function AuthProvider({ children }: React.PropsWithChildren) {
  const signInWithPassword = async (credentials: Credentials) => {
    try {
      const { data: loginResult } = await client.post<LoginResult>('/api/auth/login', { ...credentials, type: 'account' })

      if (loginResult?.authToken) {
        setToken(loginResult.authToken)

        return {}
      }

      return { error: { message: (loginResult as any)?.message } }
    }
    catch (error) {
      return { error: { message: error } }
    }
  }

  const signOut = () => {
    removeToken()
    router.replace('/sign-in')
  }

  return (
    <AuthContext.Provider
      value={{
        signInWithPassword,
        signOut,
        token: getToken(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
