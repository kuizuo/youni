import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import type { NoteItem } from '@server/modules/note/note'
import { Like } from '@/ui/icons/like'
import { trpc } from '@/utils/trpc'
import { Text, View } from '@/ui'
import tw from '@/utils/tw'

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
    <View style={tw`flex-row gap-2 items-center`}>
      <TouchableOpacity onPress={handleLike}>
        <Animated.View style={[animatedStyle]}>
          <Like
            fill={liked ? 'red' : 'transparent'}
            color={liked ? 'red' : color}
            size={size}
          />
        </Animated.View>
      </TouchableOpacity>
      <Text style={tw`text-base`}>
        {likedCount || placeholder || ' '}
      </Text>
    </View>
  )
}
