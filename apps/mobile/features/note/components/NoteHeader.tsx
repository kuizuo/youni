import type { UserInfo } from '@server/modules/user/user'
import React from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { Avatar, AvatarImage, HStack, Pressable, Text, View } from '@gluestack-ui/themed'
import { useRouter } from 'expo-router'
import { UserFollowButton } from '@/ui/components/user/UserFollowButton'
import { trpc } from '@/utils/trpc'
import { useAuth } from '@/utils/auth'
import { NoteMenu } from '@/ui/components/note/NoteMenu'
import { NavBar } from '@/ui/components/NavBar'
import { NoteShareButton } from '@/ui/components/note/NoteShareButton'
import { NavButton } from '@/ui/components/NavButton'
import { NoteBadge } from '@/ui/components/note/NoteBadge'

interface Props {
  user: Pick<UserInfo, 'id' | 'nickname' | 'avatar'>
  item: NoteItem
}

export function NoteHeader({ user, item }: Props): React.ReactNode {
  const { currentUser } = useAuth()
  const router = useRouter()
  const { data: isFollowing } = trpc.interact.isFollowing.useQuery({ id: user.id! }, { enabled: !!user.id })

  return (
    <View className="top-0 inset-x-0">
      <NavBar
        left={<NavButton.Back size="xl" />}
        right={currentUser?.id === user?.id
          ? <NoteMenu item={item} />
          : <NoteShareButton item={item} />}
      >
        <Pressable onPress={() => router.push(`/user/${user.id}/profile`)}>
          <HStack flex={1} gap="$2" alignItems="center">
            <Avatar size="sm" borderRadius="$full" overflow="hidden">
              <AvatarImage
                source={{ uri: user.avatar }}
                alt="avatar"
              />
            </Avatar>
            <Text>
              {user.nickname}
            </Text>
            {
              item.state !== 'Published' && <NoteBadge state={item.state} />
            }
          </HStack>
        </Pressable>
        {currentUser?.id !== user?.id && <UserFollowButton userId={user.id} isFollowing={isFollowing!} />}
      </NavBar>
    </View>
  )
}
