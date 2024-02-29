import { router } from "expo-router";
import { AuthContext, Credentials } from "../hooks/useAuth";
import { client } from "@/utils/http/client";
import { getToken, removeToken, setToken } from "../util";

export function AuthProvider({ children }: React.PropsWithChildren) {
  const signInWithPassword = async (credentials: Credentials) => {
    try {
      const { data } = await client.post('/api/auth/login', { ...credentials, type: 'account' })

      if (data?.authToken) {
        setToken(data.authToken);

        return {}
      }

      return { error: { message: data.message } }
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
