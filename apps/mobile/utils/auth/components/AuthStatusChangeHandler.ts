import { useAuthRedirect } from '@/utils/auth/hooks/useAuthRedirect'

export const AuthStatusChangeHandler = () => {
  useAuthRedirect()
  return null
}
