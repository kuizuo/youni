import { MessageCircle, Settings } from 'lucide-react-native'
import { Link, useRouter } from 'expo-router'
import type { UserInfo } from '@server/modules/user/user'
import { HStack, Icon, Pressable, Text, View, useToken } from '@gluestack-ui/themed'
import { useColorScheme } from 'nativewind'
import { UserFollowButton } from '@/ui/components/user/UserFollowButton'
import { trpc } from '@/utils/trpc'
import { useAuth } from '@/utils/auth'
import { useColor } from '@/utils/theme'

interface Props {
  user: UserInfo
}

export function InteractInfo({ user }: Props) {
  const router = useRouter()
  const { borderColor } = useColor()

  const { data } = trpc.interact.state.useQuery({ id: user.id })

  const { currentUser } = useAuth()

  const EditProfileButton = () => {
    return (
      <View
        className="justify-center rounded-full overflow-hidden px-4 py-2"
        borderWidth={1}
        borderColor={borderColor}
      >
        <Pressable onPress={() => router.push('/user/profile/edit')}>
          <Text color="$secondary500" fontSize="$xs">
            编辑资料
          </Text>
        </Pressable>
      </View>
    )
  }

  const SettingButton = () => {
    return (
      <View
        className="justify-center rounded-full overflow-hidde px-2 py-2"
        borderRadius="$full"
        borderWidth={1}
        borderColor={borderColor}
      >
        <Pressable onPress={() => router.push('/setting/')}>
          <Icon as={Settings} size="sm" color="$secondary500" />
        </Pressable>
      </View>
    )
  }

  const ChatButton = () => {
    return (
      <View
        className="justify-center rounded-full overflow-hidden px-2 py-2"
        borderWidth={1}
        borderColor={borderColor}
      >
        <Pressable onPress={() => router.push(`/chat/${user.id}`)}>
          <Icon as={MessageCircle} size="sm" color="$secondary500" />
        </Pressable>
      </View>
    )
  }

  return (
    <HStack gap="$4" mx="$4" mb="$3" alignItems="center">
      <Pressable
        flexDirection="row"
        gap="$1"
        onPress={() => router.push({
          pathname: '/user/[id]/follower',
          params: { id: user.id, type: 'following', title: user.nickname },
        })}
      >
        <Text>{data?.followingCount}</Text>
        <Text size="sm">
          关注
        </Text>
      </Pressable>
      <Pressable
        flexDirection="row"
        gap="$1"
        alignItems="center"
        onPress={() => router.push({
          pathname: '/user/[id]/follower',
          params: { id: user.id, type: 'followers', title: user.nickname },
        })}
      >
        <Text>{data?.followerCount}</Text>
        <Text size="sm">
          粉丝
        </Text>
      </Pressable>

      <HStack gap="$1" alignItems="center">
        <Text>{data?.likesCount}</Text>
        <Text size="sm">
          获赞
        </Text>
      </HStack>

      <HStack flex={1} justifyContent="flex-end" alignItems="center" gap="$3">
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
                <UserFollowButton userId={user.id} isFollowing={data?.isFollowing || false} />
                <ChatButton />
              </>
              )
        }
      </HStack>
    </HStack>
  )
}
