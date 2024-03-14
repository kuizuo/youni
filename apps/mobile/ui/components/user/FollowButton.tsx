import { SizableText, Text } from "@/ui"
import { trpc } from "@/utils/trpc"
import { BlurView } from "expo-blur"
import React, { useState } from "react"

interface Props {
  userId: string
  isFollowing: boolean
}

export const FollowButton = ({ userId, isFollowing: initState }: Props) => {
  const [isFollowing, setIsFollowing] = useState(initState)
  const { mutateAsync: followUser } = trpc.interact.follow.useMutation()
  const { mutateAsync: unFollowUser } = trpc.interact.unfollow.useMutation()

  const handleFollow = async () => {
    if (isFollowing) {
      await unFollowUser({ id: userId })
    } else {
      await followUser({ id: userId })
    }
    setIsFollowing(!isFollowing)
  }

  return <BlurView intensity={20} style={{
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: '#FFD036',
    paddingHorizontal: 16,
    paddingVertical: 2,
  }}>
    <SizableText theme='alt2' fontSize={'$2'} onPress={handleFollow}>
      {isFollowing ? '取关' : '关注'}
    </SizableText>
  </BlurView>
}