import React, { useEffect, useState } from 'react'
import { Button, ButtonText } from '@gluestack-ui/themed'
import { CustomDialog, useDialog } from '../CustomDialog'
import { trpc } from '@/utils/trpc'

interface Props {
  userId: string
  isFollowing: boolean
}

export function UserFollowButton({ userId, isFollowing: initState }: Props) {
  const [isFollowing, setIsFollowing] = useState(initState)
  const { mutateAsync: followUser } = trpc.interact.follow.useMutation()
  const { mutateAsync: unFollowUser } = trpc.interact.unfollow.useMutation()

  const { isOpen, openDialog, closeDialog } = useDialog()

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
    <CustomDialog
      isOpen={isOpen}
      onClose={closeDialog}
      title="确认不再关注?"
      onOk={handleUnFollow}
    >
      <Button
        px="$3"
        py="$1"
        borderRadius="$full"
        variant="outline"
        size="xs"
        bgColor={!isFollowing ? 'transport' : '$trueGray100'}
        borderColor={!isFollowing ? '$primary500' : '$trueGray300'}
        onPress={!isFollowing ? handleFollow : openDialog}
      >
        <ButtonText color={!isFollowing ? '$primary500' : '$trueGray400'}>{isFollowing ? '已关注' : '关注'}</ButtonText>
      </Button>
    </CustomDialog>
  )
}
