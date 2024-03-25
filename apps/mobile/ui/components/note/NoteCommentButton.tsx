import { MessageCircle } from '@tamagui/lucide-icons'
import type { NoteItem } from '@server/modules/note/note'
import type { ColorTokens, SizeTokens } from '../..'
import { Button, Text, XStack } from '../..'

export interface Props {
  item: NoteItem
  size?: SizeTokens
  color?: ColorTokens
}

export function NoteCommentButton({
  item,
  size = 16,
  color = 'gray',
}: Props) {
  return (
    <XStack alignItems="center" gap="$1.5">
      <Button
        icon={(
          <MessageCircle
            color={color}
            size={size}
          />
        )}
        unstyled
      >
      </Button>
      <Text fontSize={14} color={color}>
        评论
      </Text>
    </XStack>
  )
}
