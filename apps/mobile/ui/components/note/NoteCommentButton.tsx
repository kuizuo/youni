import { MessageCircle } from 'lucide-react-native'
import type { NoteItem } from '@server/modules/note/note'
import { HStack, Icon, Pressable, Text } from '@gluestack-ui/themed'
import { useState } from 'react'

export interface Props {
  item: NoteItem
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xs' | undefined
  color?: string
  placeholder?: string
  onPress?: () => void
}

export function NoteCommentButton({
  item,
  size = 'md',
  color = 'gray',
  onPress,
  placeholder,
}: Props) {
  const [commentCount, setCommentCount] = useState(item.interact.commentCount)

  return (
    <HStack alignItems="center" gap="$1">
      <Pressable onPress={onPress}>
        <Icon
          as={MessageCircle}
          color={color}
          size={size}
        />
      </Pressable>
      <Text size="sm" color="$secondary500">
        {commentCount || placeholder || '评论'}
      </Text>
    </HStack>
  )
}
