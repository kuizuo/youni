import { useSessionContext } from './useSessionContext'

export const useUser = () => {
  const { session, isLoading } = useSessionContext()
  const user = session?.user
  // TODO: Load profile information from external sources here
  // Ex: profile photo, display name, etc.
  const avatarUrl = 'https://kuizuo.cn/img/logo.png'

  return {
    session,
    avatarUrl,
    user,
    isLoading,
  }
}
