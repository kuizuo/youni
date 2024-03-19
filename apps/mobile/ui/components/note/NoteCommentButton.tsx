import { MessageCircle, Star } from "@tamagui/lucide-icons"
import { Button, ColorTokens, SizeTokens, Text, XStack } from "../.."
import { NoteItem } from "@server/modules/note/note"

export type Props = {
  item: NoteItem
  size?: SizeTokens
  color?: ColorTokens
}

export const NoteCommentButton = ({
  item,
  size = 16,
  color = 'gray'
}: Props) => {


  return <XStack alignItems="center" gap='$1.5'>
    <Button
      icon={<MessageCircle
        color={color}
        size={size} />}
      unstyled>
    </Button>
    <Text fontSize={14} color={color}>
      {'评论'}
    </Text>
  </XStack>
}
