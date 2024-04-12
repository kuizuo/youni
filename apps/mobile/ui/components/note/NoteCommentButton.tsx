import { MessageCircle } from '@tamagui/lucide-icons'
import type { NoteItem } from '@server/modules/note/note'
import type { ColorTokens, SizeTokens } from '../..'
import { Button, Text, View } from '../..'
import tw from '@/utils/tw'

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
    <View style={tw`items-center gap-1.5`}>
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
      <Text style={tw`text-base text-[${color}]`}>
        评论
      </Text>
    </View>
  )
}
