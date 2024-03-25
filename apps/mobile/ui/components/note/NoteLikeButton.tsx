import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import type { NoteItem } from '@server/modules/note/note'
import { Like } from '@/ui/icons/like'
import { trpc } from '@/utils/trpc'
import type { ColorTokens } from '@/ui'
import { SizableText, XStack } from '@/ui'

export interface Props {
  item: NoteItem
  size?: number
  color?: ColorTokens
}

export function NoteLikeButton({ item, size = 16, color = 'gray' }: Props) {
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
    <XStack gap="$1.5" ai="center">
      <TouchableOpacity onPress={handleLike}>
        <Animated.View style={[animatedStyle]}>
          <Like
            fill={liked ? 'red' : 'transparent'}
            color={liked ? 'red' : color}
            size={size}
          />
        </Animated.View>
      </TouchableOpacity>
      <SizableText fontSize={14} color={color}>
        {likedCount || ' '}
      </SizableText>
    </XStack>
  )
}
