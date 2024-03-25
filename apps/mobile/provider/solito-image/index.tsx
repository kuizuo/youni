import { SolitoImageProvider as SolitoImageProviderOG } from 'solito/image'
import { replaceLocalhost } from '@/utils/localhost.native'

export function getImageUrl() {
  const imageUrl = `${process.env.EXPO_PUBLIC_APP_URL}`
  return replaceLocalhost(imageUrl)
}

export function SolitoImageProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode {
  return (
    <SolitoImageProviderOG nextJsURL={getImageUrl() as `http:${string}` | `https:${string}`}>
      {children}
    </SolitoImageProviderOG>
  )
}
