import { MessageCircle, Settings } from 'lucide-react-native'
import { Link } from 'expo-router'
import type { UserInfo } from '@server/modules/user/user'
import { BlurView } from 'expo-blur'
import { Button, View, useTheme } from '@/ui'
import { UserFollowButton } from '@/ui/components/user/UserFollowButton'
import { trpc } from '@/utils/trpc'
import { useAuth } from '@/utils/auth'
import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'

interface Props {
  user: UserInfo
}

export function InteractInfo({ user }: Props): React.ReactNode {
  const theme = useTheme()
  const { data } = trpc.interact.state.useQuery({ id: user.id })

  const { currentUser } = useAuth()

  const EditProfileButton = () => {
    return (
      <BlurView
        intensity={20}
        className="justify-center rounded-full overflow-hidden b-1 b-gray-1 px-8 py-2"
      >
        <Link href="/profile/edit" asChild>
          <Text color="gray" fontSize={12} unstyled>
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
          <Button color="gray" icon={<Settings size="$1" />} unstyled />
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
          <MessageCircle size="$1" />
        </Link>
      </BlurView>
    )
  }

  return (
    <View className="flex-row bg-background gap-4 mx-4 mb-3 items-center">
      <Link
        href={{
          pathname: '/user/[id]/follower',
          params: { id: user.id, type: 'following', title: user.nickname },
        }}
        asChild
      >
        <HStack space="$2">
          <Text>{data?.followingCount}</Text>
          <Text fontSize="$2">
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
        <HStack space="$2" ai="center">
          <Text>{data?.followerCount}</Text>
          <Text fontSize="$2">
            粉丝
          </Text>
        </HStack>
      </Link>
      <HStack space="$2" ai="center">
        <Text>{data?.likesCount}</Text>
        <Text fontSize="$2">
          获赞
        </Text>
      </HStack>

      <HStack flex={1} jc="flex-end" gap="$3">
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
    </View>
  )
}
