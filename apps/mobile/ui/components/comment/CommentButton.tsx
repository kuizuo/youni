import { MessageCircle } from 'lucide-react-native'
import type { CommentItem } from '@server/modules/comment/comment'
import { useState } from 'react'
import { Icon, Pressable, Text } from '@gluestack-ui/themed'
import { useCommentBoxOpen, useParentComment } from '@/atoms/comment'

export interface Props {
  item: CommentItem
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xs' | undefined
}

export function CommentButton({
  item,
  size = 'md',
}: Props) {
  const [commentCount, setCommentCount] = useState(item.interact?.commentCount || 0)

  const [open, setOpen] = useCommentBoxOpen()
  const [_, setParentComment] = useParentComment()
  const handleOpenCommentModal = () => {
    setOpen(true)
    setParentComment(item)
  }

  return (
    <Pressable flexDirection="row" alignItems="center" gap="$1.5" onPress={handleOpenCommentModal}>
      <Icon
        as={MessageCircle}
        color="gray"
        size={size}
      />
      <Text color="$secondary500">
        {commentCount || ''}
      </Text>
    </Pressable>
  )
}
