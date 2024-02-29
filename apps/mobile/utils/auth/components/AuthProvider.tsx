import { router } from "expo-router"
import { AuthContext, Credentials } from "../hooks/useAuth"
import { client } from "@/utils/http/client"
import { getToken, removeToken, setToken } from "../util"
import { jotaiStore } from "@/provider/jotai/store"
import { userAtom } from "@/store/user"
import { LoginResult } from '@server/modules/auth/auth.model'
import { useAtom } from "jotai"

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useAtom(userAtom)

  const signInWithPassword = async (credentials: Credentials) => {
    try {
      const { data: loginResult } = await client.post<LoginResult>('/api/auth/login', { ...credentials, type: 'account' })

      if (loginResult?.authToken) {
        setToken(loginResult.authToken)

        // FIXME: 
        const { data: profile } = await client.get('/api/account/profile')

        jotaiStore.set(userAtom, profile)

        return {}
      }

      return { error: { message: (loginResult as any)?.message } }
    } catch (error) {
      return { error: { message: error } }
    }
  }

  const signOut = () => {
    removeToken()
    router.replace("/sign-in")
  }

  return (
    <AuthContext.Provider
      value={{
        signInWithPassword,
        signOut,
        token: getToken(),
      }}>
      {children}
    </AuthContext.Provider>
  )
}
