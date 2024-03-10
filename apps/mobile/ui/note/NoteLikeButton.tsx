import { trpc } from "@/utils/trpc"
import { Heart } from "@tamagui/lucide-icons"
import { Button, SizeTokens, XStack, Text } from ".."
import { useState } from "react"
import { NoteItem } from "@server/modules/note/note"

export interface Props {
  item: NoteItem
  size?: SizeTokens
}

export const NoteLikeButton = ({
  item,
  size = 16
}: Props) => {
  const [liked, setLiked] = useState(item.interact.liked)
  const [likedCount, setlikedCount] = useState(item.interact.likedCount)

  const { mutateAsync: likeComment } = trpc.note.like.useMutation()
  const { mutateAsync: dislikeComment } = trpc.note.dislike.useMutation()

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
        fill={liked ? '#FF2442' : 'transparent'}
        color={liked ? '#FF2442' : 'gray'}
        size={size} />}
      onPressOut={handleLike}
      unstyled>
    </Button>
    <Text fontSize={size} color={'gray'}>
      {likedCount ?? ''}
    </Text>
  </XStack>
}
