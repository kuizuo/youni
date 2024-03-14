
import { trpc } from "@/utils/trpc"
import { Heart } from "@tamagui/lucide-icons"
import { Button, SizeTokens, Text, XStack, YStack, useTheme } from "../.."
import { useState } from "react"
import { CommentItem } from "@server/modules/comment/comment"

export interface Props {
  item: CommentItem
  size?: SizeTokens
}

export const CommentLikeButton = ({
  item,
  size = 16
}: Props) => {
  const theme = useTheme()
  const [liked, setLiked] = useState(item.interact?.liked)
  const [likedCount, setlikedCount] = useState(item.interact?.likedCount)

  const { mutateAsync: likeComment } = trpc.comment.like.useMutation()
  const { mutateAsync: dislikeComment } = trpc.comment.dislike.useMutation()

  const handleLike = async () => {
    if (liked) {
      await dislikeComment({ id: item.id })
    } else {
      await likeComment({ id: item.id })
    }
    setLiked(!liked)
    setlikedCount(likedCount + (liked ? -1 : 1))
  }

  return <XStack alignItems="center" gap='$1.5'>
    <Button
      icon={<Heart
        fill={liked ? theme.$red10?.get() : 'transparent'}
        color={liked ? theme.$red10?.get() : 'gray'}
        size={size} />}
      onPressOut={handleLike}
      unstyled>
    </Button>
    <Text fontSize={size} color={'gray'}>
      {likedCount || ''}
    </Text>
  </XStack>
}