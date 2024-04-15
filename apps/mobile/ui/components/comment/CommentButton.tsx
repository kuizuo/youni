import { MessageCircle } from 'lucide-react-native'
import type { CommentItem } from '@server/modules/comment/comment'
import { useState } from 'react'
import type { SizeTokens } from '@/ui'
import { Button, HStack, Text } from '@/ui'
import { useCommentModalOpen, useParentComment } from '@/atoms/comment'

export interface Props {
  item: CommentItem
  size?: SizeTokens
}

export function CommentButton({
  item,
  size = 16,
}: Props) {
  const [commentCount, setCommentCount] = useState(item.interact?.commentCount || 0)

  const [open, setOpen] = useCommentModalOpen()
  const [_, setParentComment] = useParentComment()
  const handleOpenCommentModal = () => {
    setOpen(true)
    setParentComment(item)
  }

  return (
    <HStack ai="center" gap="$1.5">
      <Button
        icon={<MessageCircle color="gray" size={size} />}
        onPress={handleOpenCommentModal}
        unstyled
      >
      </Button>
      <Text fontSize={size} color="gray">
        {commentCount || ''}
      </Text>
    </HStack>
  )
}
