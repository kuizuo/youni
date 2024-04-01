import { AuthStatusChangeHandler } from '@/utils/auth/components/AuthStatusChangeHandler'
import { AuthProvider as AuthProviderOG } from '@/utils/auth/components/AuthProvider'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProviderOG>
      <AuthStatusChangeHandler />
      {children}
    </AuthProviderOG>
  )
}
