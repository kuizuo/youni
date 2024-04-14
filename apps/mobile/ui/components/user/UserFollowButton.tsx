import React, { useState } from 'react'
import { CustomDialog } from '../CustomDialog'
import { Text, View } from '@/ui'
import { trpc } from '@/utils/trpc'

interface Props {
  userId: string
  isFollowing: boolean
}

export function UserFollowButton({ userId, isFollowing: initState }: Props) {
  const [isFollowing, setIsFollowing] = useState(initState)
  const { mutateAsync: followUser } = trpc.interact.follow.useMutation()
  const { mutateAsync: unFollowUser } = trpc.interact.unfollow.useMutation()

  const handleFollow = async () => {
    if (!isFollowing) {
      await followUser({ id: userId })
      setIsFollowing(true)
    }
  }

  const handleUnFollow = async () => {
    if (isFollowing) {
      await unFollowUser({ id: userId })
      setIsFollowing(false)
    }
  }

  return (
    <>
      <CustomDialog title="确认不再关注?" onOk={handleUnFollow}>
        <View className="flex-row rounded-full overflow-hidden bg-primary py-4">
          <Text className="text-base" onPress={isFollowing ? () => null : handleFollow}>
            {isFollowing ? '取关' : '关注'}
          </Text>
        </View>
      </CustomDialog>
    </>
  )
}
