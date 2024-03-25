import { UserFollowButton } from "@/ui/components/user/UserFollowButton"
import { UserInfo } from "@server/modules/user/user"
import { Link } from "expo-router"
import { XStack, Avatar, Text } from "@/ui"
import { trpc } from "@/utils/trpc"
import { useUser } from "@/utils/auth/hooks/useUser"
import React from "react"
import { NoteMenu } from "@/ui/components/note/NoteMenu"
import { NavBar } from "@/ui/components/NavBar"
import { NoteItem } from "../../../server/src/modules/note/note"
import { NoteShareButton } from "@/ui/components/note/NoteShareButton"
import { BackButton } from "@/ui/components/BackButton"

interface Props {
  user: Pick<UserInfo, 'id' | 'nickname' | 'avatar'>
  item: NoteItem
}

export const NoteHeader = ({ user, item }: Props): React.ReactNode => {
  const { currentUser } = useUser()

  const { data: isFollowing, isLoading } = trpc.interact.isFollowing.useQuery({ id: user.id! }, { enabled: !!user.id })

  return <NavBar
    left={<BackButton />}
    right={currentUser?.id === user?.id
      ? <NoteMenu item={item} />
      : <>
        <NoteShareButton item={item} />
      </>
    }>
    <Link href={`/user/${user.id}/profile`} asChild>
      <XStack flex={1} gap='$2.5' alignItems='center'>
        <Avatar circular size="$2">
          <Avatar.Image
            // @ts-ignore
            source={{
              uri: user.avatar!,
              width: '100%',
              height: '100%',
            }}
          />
          <Avatar.Fallback />
        </Avatar>
        <Text fontSize={14} opacity={0.7} >
          {user.nickname}
        </Text>
      </XStack>
    </Link>
    {currentUser?.id !== user?.id && <UserFollowButton userId={user.id} isFollowing={isFollowing!} />}
  </NavBar>
}