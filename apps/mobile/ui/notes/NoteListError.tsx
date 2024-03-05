import { Paragraph, YStack } from '@/ui'

interface Props {
  message: string | undefined
}

export const NoteListError = ({ message }: Props): React.ReactElement => {
  return (
    <YStack fullscreen flex={1} justifyContent='center' alignContent='center' padding='$6'>
      <Paragraph paddingBottom='$3'>Error fetching</Paragraph>
      <Paragraph>{message}</Paragraph>
    </YStack>
  )
}
