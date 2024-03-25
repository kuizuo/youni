import { useAuthRedirect } from '@/utils/auth/hooks/useAuthRedirect'

export function AuthStatusChangeHandler() {
  useAuthRedirect()
  return null
}
