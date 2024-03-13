import { useUser } from "@/utils/auth/hooks/useUser"
import { trpc } from "@/utils/trpc"
import { MessageCircle, Settings } from "@tamagui/lucide-icons"
import { Link } from "expo-router"
import { XStack } from "tamagui"
import { Text, Button } from '@/ui'
import { FollowButton } from "@/ui/user/FollowButton"
import { UserInfo } from "@server/modules/user/user"

interface Props {
  user: UserInfo
}

export const InteractInfo = ({ user }: Props): React.ReactNode => {
  const { data } = trpc.interact.state.useQuery({ id: user.id })

  const { currentUser } = useUser()

  const EditProfileButton = () => {
    return <Link href="/profile/edit" asChild>
      <Button themeInverse size={'$2'} outlineColor={'white'} backgroundColor={'aliceblue'} borderRadius={50}>
        编辑资料
      </Button>
    </Link>
  }

  const SettingButton = () => {
    return <Link href='/setting/' asChild>
      <Button themeInverse size={'$2'} outlineColor={'white'} backgroundColor={'aliceblue'} borderRadius={50} icon={<Settings />} />
    </Link>
  }

  const ChatButton = () => {
    return <Link href={`/chat/${user.id}`} asChild>
      <Button themeInverse size={'$2'} outlineColor={'red'} borderRadius={50} icon={<MessageCircle />} />
    </Link>
  }

  return <XStack gap='$4' padding='$4' alignItems="center">
    <Link
      href={{
        pathname: '/user/[id]/follower',
        params: { id: user.id, type: 'following', title: user.nickname }
      }}
      asChild
    >
      <XStack gap='$2' alignItems="center">
        <Text>{data?.followingCount}</Text>
        <Text fontSize='$2'>
          关注
        </Text>
      </XStack>
    </Link>
    <Link
      href={{
        pathname: '/user/[id]/follower',
        params: { id: user.id, type: 'followers', title: user.nickname }
      }}
      asChild
    >
      <XStack gap='$2' alignItems="center">
        <Text>{data?.followerCount}</Text>
        <Text fontSize='$2'>
          粉丝
        </Text>
      </XStack>
    </Link>
    <XStack gap='$2' alignItems="center">
      <Text>{data?.likesCount}</Text>
      <Text fontSize='$2'>
        获赞
      </Text>
    </XStack>

    <XStack flex={1} justifyContent="flex-end" gap="$3">
      {
        user.id === currentUser!.id ?
          <>
            <EditProfileButton />
            <SettingButton />
          </> :
          <>
            <FollowButton userId={user.id} isFollowing={data?.isFollowing!} />
            <ChatButton />
          </>
      }
    </XStack>
  </XStack >
}
