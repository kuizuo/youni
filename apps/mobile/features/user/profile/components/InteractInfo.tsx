import { MessageCircle, Settings } from '@tamagui/lucide-icons'
import { Link } from 'expo-router'
import type { UserInfo } from '@server/modules/user/user'
import { BlurView } from 'expo-blur'
import { Button, Text, XStack, useTheme } from '@/ui'
import { UserFollowButton } from '@/ui/components/user/UserFollowButton'
import { trpc } from '@/utils/trpc'
import { useUser } from '@/utils/auth/hooks/useUser'

interface Props {
  user: UserInfo
}

export function InteractInfo({ user }: Props): React.ReactNode {
  const theme = useTheme()
  const { data } = trpc.interact.state.useQuery({ id: user.id })

  const { currentUser } = useUser()

  const EditProfileButton = () => {
    return (
      <BlurView
        intensity={20}
        style={{
          justifyContent: 'center',
          borderRadius: 50,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: theme.$borderColor?.get(),
          paddingHorizontal: 8,
          paddingVertical: 2,
        }}
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
        style={{
          justifyContent: 'center',
          borderRadius: 50,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: theme.$borderColor?.get(),
          paddingHorizontal: 6,
          paddingVertical: 4,
        }}
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
        style={{
          borderRadius: 50,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: theme.$borderColor?.get(),
          paddingHorizontal: 6,
          paddingVertical: 4,
          justifyContent: 'center',
        }}
      >
        <Link href={`/chat/${user.id}`} asChild>
          <MessageCircle size="$1" />
        </Link>
      </BlurView>
    )
  }

  return (
    <XStack gap="$4" mx="$4" marginBottom="$3" ai="center">
      <Link
        href={{
          pathname: '/user/[id]/follower',
          params: { id: user.id, type: 'following', title: user.nickname },
        }}
        asChild
      >
        <XStack gap="$2" ai="center">
          <Text>{data?.followingCount}</Text>
          <Text fontSize="$2">
            关注
          </Text>
        </XStack>
      </Link>
      <Link
        href={{
          pathname: '/user/[id]/follower',
          params: { id: user.id, type: 'followers', title: user.nickname },
        }}
        asChild
      >
        <XStack gap="$2" ai="center">
          <Text>{data?.followerCount}</Text>
          <Text fontSize="$2">
            粉丝
          </Text>
        </XStack>
      </Link>
      <XStack gap="$2" ai="center">
        <Text>{data?.likesCount}</Text>
        <Text fontSize="$2">
          获赞
        </Text>
      </XStack>

      <XStack flex={1} jc="flex-end" gap="$3">
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
      </XStack>
    </XStack>
  )
}
