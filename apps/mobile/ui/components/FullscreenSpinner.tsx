import { Spinner, YStack } from '@/ui'

export const FullscreenSpinner = () => {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center">
      <Spinner />
    </YStack>
  )
}
