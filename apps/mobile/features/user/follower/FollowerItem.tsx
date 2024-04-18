import { useRouter } from 'expo-router'
import type { UserInfoWithFollow } from '@server/modules/interact/interact'
import { Avatar, AvatarImage, HStack, Pressable, Text, VStack } from '@gluestack-ui/themed'
import { UserFollowButton } from '@/ui/components/user/UserFollowButton'
import { useAuth } from '@/utils/auth'

export function FollowerListItem(item: UserInfoWithFollow): React.ReactElement {
  const { currentUser } = useAuth()
  const router = useRouter()

  const handleNavigateToUser = () => {
    router.push(`/user/${item.id}/profile`)
  }

  return (
    <HStack p="$3" gap="$3" alignItems="center">
      <Pressable onPress={handleNavigateToUser}>
        <Avatar borderRadius="$full" size="lg" overflow="hidden">
          <AvatarImage
            source={{ uri: item.avatar }}
            alt="avatar"
          />
        </Avatar>
      </Pressable>

      <Pressable flex={1} onPress={handleNavigateToUser}>
        <HStack gap="$2">
          <Text size="sm">
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
      </Pressable>
      {currentUser?.id !== item.id && <UserFollowButton isFollowing={item.isFollowing} userId={item.id} />}
    </HStack>
  )
}
