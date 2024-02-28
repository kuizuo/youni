import { useAuth } from '@/utils/auth/hooks/useAuth'
import { useRouter as useNextRouter } from 'next/router'
import { useEffect } from 'react'
import { useRouter } from 'solito/navigation'

export const useAuthRedirect = () => {
  const router = useRouter()
  const { pathname } = useNextRouter()

  // useEffect(() => {
  //   const signOutListener = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent) => {
  //     if (event === 'SIGNED_OUT') {
  //       if (pathname !== '/') {
  //         router.replace('/')
  //       }
  //     }
  //   })
  //   return () => {
  //     signOutListener.data.subscription.unsubscribe()
  //   }
  // }, [router, pathname])
}
