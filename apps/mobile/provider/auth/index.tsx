import { AuthStatusChangeHandler } from '@/utils/auth/components/AuthStatusChangeHandler'
import { AuthProvider as AuthProviderOG } from '@/utils/auth/components/AuthProvider'

export const AuthProvider = ({ children }) => {
  return (
    <AuthProviderOG>
      <AuthStatusChangeHandler />
      {children}
    </AuthProviderOG>
  )
}
