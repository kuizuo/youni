import type { UserInfo } from '@server/modules/user/user'
import { Link } from 'expo-router'
import React from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { UserFollowButton } from '@/ui/components/user/UserFollowButton'
import { Avatar, Text, View } from '@/ui'
import { trpc } from '@/utils/trpc'
import { useUser } from '@/utils/auth/hooks/useUser'
import { NoteMenu } from '@/ui/components/note/NoteMenu'
import { NavBar } from '@/ui/components/NavBar'
import { NoteShareButton } from '@/ui/components/note/NoteShareButton'
import { NavButton } from '@/ui/components/NavButton'
import tw from '@/utils/tw'

interface Props {
  user: Pick<UserInfo, 'id' | 'nickname' | 'avatar'>
  item: NoteItem
}

export function NoteHeader({ user, item }: Props): React.ReactNode {
  const { currentUser } = useUser()

  const { data: isFollowing } = trpc.interact.isFollowing.useQuery({ id: user.id! }, { enabled: !!user.id })

  return (
    <NavBar
      left={<NavButton.Back />}
      right={currentUser?.id === user?.id
        ? <NoteMenu item={item} />
        : (
          <>
            <NoteShareButton item={item} />
          </>
      )}
      style={{
        marginBottom: 8,
      }}
    >
      <Link href={`/user/${user.id}/profile`} asChild>
        <View style={tw`flex-row flex-1 gap-2 items-center`}>
          <Avatar circular size="$2">
            <Avatar.Image
              // @ts-expect-error
              source={{
                uri: user.avatar!,
                width: '100%',
                height: '100%',
              }}
            />
            <Avatar.Fallback />
          </Avatar>
          <Text style={tw`text-base opacity-70`}>
            {user.nickname}
          </Text>
        </View>
      </Link>
      {currentUser?.id !== user?.id && <UserFollowButton userId={user.id} isFollowing={isFollowing!} />}
    </NavBar>
  )
}
