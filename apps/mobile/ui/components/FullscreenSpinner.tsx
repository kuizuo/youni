import { Spinner, VStack } from '@/ui'

export function FullscreenSpinner() {
  return (
    <VStack flex={1} justifyContent="center" alignItems="center">
      <Spinner />
    </VStack>
  )
}
