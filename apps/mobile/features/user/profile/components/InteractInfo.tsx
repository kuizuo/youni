import { MessageCircle, Settings } from 'lucide-react-native'
import { Link } from 'expo-router'
import type { UserInfo } from '@server/modules/user/user'
import { BlurView } from 'expo-blur'
import { HStack, Icon, Text, View } from '@gluestack-ui/themed'
import { UserFollowButton } from '@/ui/components/user/UserFollowButton'
import { trpc } from '@/utils/trpc'
import { useAuth } from '@/utils/auth'

interface Props {
  user: UserInfo
}

export function InteractInfo({ user }: Props): React.ReactNode {
  const { data } = trpc.interact.state.useQuery({ id: user.id })

  const { currentUser } = useAuth()

  const EditProfileButton = () => {
    return (
      <BlurView
        intensity={20}
        className="justify-center rounded-full overflow-hidden b-1 b-gray-1 px-8 py-2"
      >
        <Link href="/user/profile/edit" asChild>
          <Text color="$secondary500" fontSize={12}>
            编辑资料
          </Text>
        </Link>
      </BlurView>
    )
  }

  const SettingButton = () => {
    return (
      <BlurView
        intensity={20}
        className="justify-center rounded-full overflow-hidden b-1 b-gray-1 px-8 py-2"
      >
        <Link href="/setting/" asChild>
          <Icon as={Settings} />
        </Link>
      </BlurView>
    )
  }

  const ChatButton = () => {
    return (
      <BlurView
        intensity={20}
        className="justify-center rounded-full overflow-hidden b-1 b-gray-1 px-8 py-2"
      >
        <Link href={`/chat/${user.id}`} asChild>
          <MessageCircle size="xs" />
        </Link>
      </BlurView>
    )
  }

  return (
    <HStack gap="$4" mx="$4" mb="$3" alignContent="center">
      <Link
        href={{
          pathname: '/user/[id]/follower',
          params: { id: user.id, type: 'following', title: user.nickname },
        }}
        asChild
      >
        <HStack gap="$1">
          <Text>{data?.followingCount}</Text>
          <Text size="xs">
            关注
          </Text>
        </HStack>
      </Link>
      <Link
        href={{
          pathname: '/user/[id]/follower',
          params: { id: user.id, type: 'followers', title: user.nickname },
        }}
        asChild
      >
        <HStack gap="$1" alignContent="center">
          <Text>{data?.followerCount}</Text>
          <Text size="xs">
            粉丝
          </Text>
        </HStack>
      </Link>
      <HStack gap="$1" alignContent="center">
        <Text>{data?.likesCount}</Text>
        <Text size="xs">
          获赞
        </Text>
      </HStack>

      <HStack flex={1} justifyContent="flex-end" gap="$3">
        {
          user.id === currentUser?.id
            ? (
              <>
                <EditProfileButton />
                <SettingButton />
              </>
              )
            : (
              <>
                <UserFollowButton userId={user.id} isFollowing={data?.isFollowing} />
                <ChatButton />
              </>
              )
        }
      </HStack>
    </HStack>
  )
}
