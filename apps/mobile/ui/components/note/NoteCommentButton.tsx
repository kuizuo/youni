import { MessageCircle } from 'lucide-react-native'
import type { NoteItem } from '@server/modules/note/note'
import type { ColorTokens, SizeTokens } from '../..'
import { Button, Text, View } from '../..'

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
    <View className="items-center gap-1.5">
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
      <Text className="text-base text-[${color}]">
        评论
      </Text>
    </View>
  )
}
