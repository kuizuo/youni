import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import type { CommentItem } from '@server/modules/comment/comment'
import { trpc } from '@/utils/trpc'
import { Like } from '@/ui/icons/like'
import type { SizeTokens } from '@/ui'
import { SizableText, XStack, useTheme } from '@/ui'

export interface Props {
  item: CommentItem
  size?: SizeTokens
}

export function CommentLikeButton({ item, size = 16 }: Props) {
  const theme = useTheme()
  const [liked, setLiked] = useState(item.interact?.liked)
  const [likedCount, setLikedCount] = useState(item.interact?.likedCount)

  const scale = useSharedValue(1)

  const { mutateAsync: likeComment } = trpc.comment.like.useMutation()
  const { mutateAsync: dislikeComment } = trpc.comment.dislike.useMutation()

  const handleLike = async () => {
    scale.value = withSpring(1.2)
    runOnJS(toggleLike)()
  }

  const toggleLike = async () => {
    if (liked)
      await dislikeComment({ id: item.id })
    else
      await likeComment({ id: item.id })

    setLiked(!liked)
    setLikedCount(likedCount + (liked ? -1 : 1))
    scale.value = withSpring(1)
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    }
  })

  return (
    <XStack gap="$1.5" ai="center">
      <TouchableOpacity onPress={handleLike}>
        <Animated.View style={[animatedStyle]}>
          <Like
            fill={liked ? 'red' : 'transparent'}
            color={liked ? 'red' : 'gray'}
            size={size}
          />
        </Animated.View>
      </TouchableOpacity>
      <SizableText fontSize={size} color="gray">
        {likedCount || ' '}
      </SizableText>
    </XStack>
  )
}
