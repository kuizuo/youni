import React, { useState } from 'react'
import { CustomDialog } from '../CustomDialog'
import { SizableText, Theme, View, useTheme } from '@/ui'
import { trpc } from '@/utils/trpc'

interface Props {
  userId: string
  isFollowing: boolean
}

export function UserFollowButton({ userId, isFollowing: initState }: Props) {
  const theme = useTheme()

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
        <View style={{
          flexDirection: 'row',
          borderRadius: 50,
          overflow: 'hidden',
          backgroundColor: theme.$accent10?.get(),
          paddingHorizontal: 16,
        }}
        >
          <Theme name="dark">
            <SizableText fontSize={16} onPress={isFollowing ? null : handleFollow}>
              {isFollowing ? '取关' : '关注'}
            </SizableText>
          </Theme>
        </View>
      </CustomDialog>
    </>
  )
}
