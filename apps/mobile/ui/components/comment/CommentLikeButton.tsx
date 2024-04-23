import React, { useState } from 'react'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import type { CommentItem } from '@server/modules/comment/comment'
import { HStack, Icon, Text } from '@gluestack-ui/themed'
import { Heart } from 'lucide-react-native'
import { RectButton } from 'react-native-gesture-handler'
import { trpc } from '@/utils/trpc'

import { Like } from '@/ui/icons/like'

export interface Props {
  item: CommentItem
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xs' | undefined
  color?: string
  placeholder?: string
}

export function CommentLikeButton({
  item,
  size = 'md',
  color = 'gray',
  placeholder,
}: Props) {
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
    <HStack gap="$1.5" alignItems="center">
      <RectButton onPress={handleLike}>
        <Animated.View style={[animatedStyle]}>
          <Icon
            as={Heart}
            fill={liked ? 'red' : 'transparent'}
            color={liked ? 'red' : color}
            size={size}
          />
        </Animated.View>
      </RectButton>
      <Text color="$secondary500">
        {likedCount || placeholder}
      </Text>
    </HStack>
  )
}
