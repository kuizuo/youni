import { Spinner, VStack } from '@gluestack-ui/themed'

export function FullscreenSpinner() {
  return (
    <VStack flex={1} justifyContent="center" alignItems="center">
      <Spinner />
    </VStack>
  )
}
