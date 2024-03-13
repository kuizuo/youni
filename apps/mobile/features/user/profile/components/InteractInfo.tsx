import { useUser } from "@/utils/auth/hooks/useUser"
import { trpc } from "@/utils/trpc"
import { MessageCircle, Settings } from "@tamagui/lucide-icons"
import { Link } from "expo-router"
import { XStack } from "tamagui"
import { Text, Button } from '@/ui'
import { FollowButton } from "@/ui/user/FollowButton"
import { UserInfo } from "@server/modules/user/user"
import { BlurView } from "expo-blur"

interface Props {
  user: UserInfo
}

export const InteractInfo = ({ user }: Props): React.ReactNode => {
  const { data } = trpc.interact.state.useQuery({ id: user.id })

  const { currentUser } = useUser()

  const EditProfileButton = () => {
    return <BlurView intensity={20} style={{
      borderRadius: 50,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: '#f1f5f9',
      paddingHorizontal: 8,
      paddingVertical: 2,
    }}>
      <Link href="/profile/edit" asChild>
        <Text color="#f1f5f9" fontSize={12} unstyled>
          编辑资料
        </Text>
      </Link>
    </BlurView>
  }

  const SettingButton = () => {
    return <BlurView intensity={20} style={{
      borderRadius: 50,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: '#f1f5f9',
      paddingHorizontal: 6,
      paddingVertical: 2,
    }}>
      <Link href='/setting/' asChild>
        <Button icon={<Settings size="$1" />} unstyled />
      </Link>
    </BlurView>
  }

  const ChatButton = () => {
    return <BlurView intensity={20} style={{
      borderRadius: 50,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: '#f1f5f9',
      paddingHorizontal: 6,
    }}>
      <Link href={`/chat/${user.id}`} asChild>
        <MessageCircle size="$1" />
      </Link >
    </BlurView>
  }

  return <XStack gap='$4' marginHorizontal='$4' marginBottom='$3' alignItems="center">
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
