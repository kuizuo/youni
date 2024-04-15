import { useRouter } from 'expo-router'
import type { UserInfoWithFollow } from '@server/modules/interact/interact'
import { UserFollowButton } from './UserFollowButton'
import { Avatar, HStack, Text, VStack } from '@/ui'
import { useAuth } from '@/utils/auth'

export function UserListItem(item: UserInfoWithFollow): React.ReactElement {
  const { currentUser } = useAuth()
  const router = useRouter()

  const handleNavigateToUser = () => {
    router.push(`/user/${item.id}/profile`)
  }

  return (
    <HStack p="$3" gap="$3" height="$8" ai="center">
      <Avatar borderRadius="$full" size="lg" onPress={handleNavigateToUser}>
        <AvatarImage
          width="100%"
          height="100%"
          source={{
            uri: item.avatar,
          }}
        />

      </Avatar>
      <VStack flex={1} onPress={handleNavigateToUser}>
        <HStack gap="$2">
          <Text size="$4">
            {item.nickname}
          </Text>
        </HStack>

        <Text size="sm" color="gray">
          {item.desc}
          {/* TODO: 笔记 · 1 | 粉丝 · 1 */}
        </Text>
      </VStack>
      {currentUser?.id !== item.id && <UserFollowButton isFollowing={item.isFollowing} userId={item.id} />}
    </HStack>
  )
}
