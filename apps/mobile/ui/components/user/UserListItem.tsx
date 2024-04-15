import { useRouter } from 'expo-router'
import type { UserInfoWithFollow } from '@server/modules/interact/interact'
import { UserFollowButton } from './UserFollowButton'
import { Avatar, SizableText, XStack, YStack } from '@/ui'
import { useAuth } from '@/utils/auth'

export function UserListItem(item: UserInfoWithFollow): React.ReactElement {
  const { currentUser } = useAuth()
  const router = useRouter()

  const handleNavigateToUser = () => {
    router.push(`/user/${item.id}/profile`)
  }

  return (
    <XStack p="$3" gap="$3" height="$8" ai="center">
      <Avatar circular size="$5" onPress={handleNavigateToUser}>
        <Avatar.Image
          width="100%"
          height="100%"
          source={{
            uri: item.avatar,
          }}
        />
        <Avatar.Fallback />
      </Avatar>
      <YStack flex={1} onPress={handleNavigateToUser}>
        <XStack gap="$2">
          <SizableText size="$4">
            {item.nickname}
          </SizableText>
        </XStack>

        <SizableText size="$1" color="gray">
          {item.desc}
          {/* TODO: 笔记 · 1 | 粉丝 · 1 */}
        </SizableText>
      </YStack>
      {currentUser?.id !== item.id && <UserFollowButton isFollowing={item.isFollowing} userId={item.id} />}
    </XStack>
  )
}
