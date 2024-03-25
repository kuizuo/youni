import { Spinner, YStack } from '@/ui'

export function FullscreenSpinner() {
  return (
    <YStack flex={1} jc="center" ai="center">
      <Spinner />
    </YStack>
  )
}
