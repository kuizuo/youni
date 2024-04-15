import { Spinner, VStack } from '@/ui'

export function FullscreenSpinner() {
  return (
    <VStack flex={1} jc="center" ai="center">
      <Spinner />
    </VStack>
  )
}
