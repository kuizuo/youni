import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import type { NoteItem } from '@server/modules/note/note'
import { HStack, Text } from '@gluestack-ui/themed'
import { Heart } from 'lucide-react-native'
import { trpc } from '@/utils/trpc'

export interface Props {
  item: NoteItem
  size?: number
  color?: string
  placeholder?: string
}

export function NoteLikeButton({ item, size = 18, color = 'gray', placeholder }: Props) {
  const [liked, setLiked] = useState(item.interact.liked)
  const [likedCount, setLikedCount] = useState(item.interact.likedCount)

  const scale = useSharedValue(1)

  const { mutateAsync: likeNote } = trpc.note.like.useMutation()
  const { mutateAsync: dislikeNote } = trpc.note.dislike.useMutation()

  const handleLike = async () => {
    scale.value = withSpring(1.2)
    runOnJS(toggleLike)()
  }

  const toggleLike = async () => {
    if (liked)
      await dislikeNote({ id: item.id })
    else
      await likeNote({ id: item.id })

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
    <HStack alignItems="center" gap="$1">
      <TouchableOpacity onPress={handleLike}>
        <Animated.View style={[animatedStyle]}>
          <Heart
            fill={liked ? 'red' : 'transparent'}
            color={liked ? 'red' : color}
            size={size}
          />
        </Animated.View>
      </TouchableOpacity>
      <Text color="$secondary500">
        {likedCount || placeholder }
      </Text>
    </HStack>
  )
}
