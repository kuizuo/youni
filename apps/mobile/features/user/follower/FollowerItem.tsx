import { useRouter } from 'expo-router'
import type { UserInfoWithFollow } from '@server/modules/interact/interact'
import { Avatar, HStack, Text, VStack } from '@/ui'
import { UserFollowButton } from '@/ui/components/user/UserFollowButton'
import { useAuth } from '@/utils/auth'

export function FollowerListItem(item: UserInfoWithFollow): React.ReactElement {
  const { currentUser } = useAuth()
  const router = useRouter()

  const handleNavigateToUser = () => {
    router.push(`/user/${item.id}/profile`)
  }

  return (
    <HStack p="$3" gap="$3" height="$8" alignItems="center">
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
          {
            item.noteCount > 0 ? `笔记 · ${item.noteCount}` : <></>
          }
          {
            item.followerCount > 0 ? `粉丝 · ${item.followerCount}` : <></>
          }
        </Text>
      </VStack>
      {currentUser?.id !== item.id && <UserFollowButton isFollowing={item.isFollowing} userId={item.id} />}
    </HStack>
  )
}
