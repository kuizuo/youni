import React, { useState } from 'react'
import { AlertDialog, Button, SizableText, Theme, View, XStack, YStack, useTheme } from '@/ui'
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
      <AlertDialog>
        <AlertDialog.Trigger asChild>
          <View style={{
            borderRadius: 50,
            overflow: 'hidden',
            backgroundColor: theme.$accent10?.get(),
            paddingHorizontal: 12,
          }}
          >
            <Theme name="dark">
              <SizableText fontSize={14} onPress={() => isFollowing ? null : handleFollow()}>
                {isFollowing ? '取关' : '关注'}
              </SizableText>
            </Theme>
          </View>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <AlertDialog.Content
            bordered
            elevate
            key="content"
            animation={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            x={0}
            scale={1}
            opacity={1}
            y={0}
          >
            <YStack gap="$4" minWidth="80%">
              <AlertDialog.Title size="$4">确认不再关注?</AlertDialog.Title>
              <XStack gap="$3" jc="flex-end">
                <AlertDialog.Cancel asChild>
                  <Button size="$2">取消</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <Button size="$2" theme="red" onPress={handleUnFollow}>确认</Button>
                </AlertDialog.Action>
              </XStack>
            </YStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    </>
  )
}
