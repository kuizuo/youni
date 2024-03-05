import { Heart, Star } from "@tamagui/lucide-icons"
import { Button, SizeTokens, Text, XStack, YStack } from ".."
import { trpc } from "@/utils/trpc"
import React from "react"

export type LikeButtonProps = {
  liked: boolean
  likeCount: number
  itemId: string
  size?: SizeTokens
}

export const CommentLikeButton = ({
  liked,
  likeCount,
  itemId,
  size = 16
}: LikeButtonProps) => {
  const { mutate, isLoading: isLiking } = trpc.comment.like.useMutation({
    // TODO: 乐观更新
  });

  const handleLike = () => {
    mutate({ id: itemId });
  }

  return <YStack alignItems="center" gap='$1.5'>
    <Button
      icon={<Heart
        fill={liked ? '#FF2442' : 'transparent'}
        color={liked ? '#FF2442' : 'gray'}
        size={size} />}
      onPressOut={handleLike}
      unstyled>
    </Button>
    <Text fontSize={size} color={'gray'}>
      {likeCount ?? ''}
    </Text>
  </YStack>
}

export const NoteLikeButton = ({
  liked,
  likeCount,
  itemId,
  size = 16
}: LikeButtonProps) => {
  const { mutate, isLoading: isLiking } = trpc.note.like.useMutation({
    // TODO: 乐观更新
  });

  const handleLike = () => {
    mutate({ id: itemId });
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
      {likeCount ?? ''}
    </Text>
  </XStack>
}

export const NoteCollectButton = ({
  collected,
  collectCount,
  itemId,
  size = 16
}: {
  collected: boolean
  collectCount: number
  itemId: string
  size?: SizeTokens
}) => {
  const { mutate, isLoading: isLiking } = trpc.collection.addItem.useMutation({
    // TODO: 乐观更新
  });

  const handleCollect = () => {
    mutate({ itemId: itemId });
  }

  return <XStack alignItems="center">
    <Button
      icon={<Star
        fill={collected ? '#FDBC5F' : 'transparent'}
        color={collected ? '#FDBC5F' : 'gray'}
        size={size} />}
      onPressOut={handleCollect}
      unstyled>
    </Button>
    <Text marginLeft="$1.5" fontSize={size} color={'gray'}>
      {collectCount}
    </Text>
  </XStack>
}