import { Paragraph, YStack } from '@/ui'

interface Props {
  message: string | undefined
  image?: React.ReactNode
}

export const EmptyResult = ({ message, image }: Props): React.ReactElement => {
  return (
    <YStack flex={1} justifyContent='center' alignItems='center' padding='$6' gap='$3'>
      {image}
      <Paragraph>{message}</Paragraph>
    </YStack>
  )
}
