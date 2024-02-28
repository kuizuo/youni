import { useEffect } from 'react'
import { useRouter } from 'solito/navigation'

export const useAuthRedirect = () => {
  const [, setSession] = useSession()
  const [, setLoading] = useIsLoadingSession()

  const router = useRouter()
  // useEffect(() => {
  //   const signOutListener = supabase.auth.onAuthStateChange(
  //     async (event: AuthChangeEvent, session: Session) => {
  //       if (event === 'SIGNED_OUT') {
  //         setSession(null)
  //         router.replace('/')
  //       }
  //       if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
  //         setLoading(true)
  //         setSession(session)
  //         setLoading(false)
  //       }
  //     }
  //   )
  //   return () => {
  //     signOutListener.data.subscription.unsubscribe()
  //   }
  // }, [supabase, router, setSession, setLoading])
}
