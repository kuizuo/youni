import { AuthContext, Credentials } from "../hooks/useAuth";
import { useStorageState } from "../hooks/useStorageState";

export function AuthProvider(props: React.PropsWithChildren) {
  const baseApiUrl = process.env.EXPO_PUBLIC_API_URL;
  const [[isLoading, token], setToken] = useStorageState('token');

  return (
    <AuthContext.Provider
      value={{
        signInWithPassword: async (credentials: Credentials) => {
          const response = await fetch(`${baseApiUrl}/auth/login`, {
            body: JSON.stringify(credentials)
          })
          const json = await response.json()

          console.log(json)

          if (response.ok) {
            return { error: '' }
          }

          return { error: null }

        },
        signOut: () => {
          setToken("");
        },
        token,
        isLoading,
      }
      }>
      {props.children}
    </AuthContext.Provider>
  )
}
