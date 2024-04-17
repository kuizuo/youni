import { useRouter } from 'expo-router'
import type { UserInfoWithFollow } from '@server/modules/interact/interact'
import { Avatar, AvatarImage, HStack, Pressable, Text, VStack, View } from '@gluestack-ui/themed'
import { UserFollowButton } from './UserFollowButton'
import { useAuth } from '@/utils/auth'

export function UserListItem(item: UserInfoWithFollow): React.ReactElement {
  const { currentUser } = useAuth()
  const router = useRouter()

  const handleNavigateToUser = () => {
    router.push(`/user/${item.id}/profile`)
  }

  return (
    <Pressable onPress={handleNavigateToUser}>
      <HStack p="$3" gap="$3" alignItems="center">
        <Avatar borderRadius="$full" size="lg">
          <AvatarImage
            source={{
              uri: item.avatar,
            }}
          />

        </Avatar>

        <VStack flex={1}>
          <HStack gap="$2">
            <Text size="md">
              {item.nickname}
            </Text>
          </HStack>

          <Text size="sm" color="gray">
            {item.desc}
            {/* TODO: 笔记 · 1 | 粉丝 · 1 */}
          </Text>
        </VStack>

        <View>
          {currentUser?.id !== item.id && <UserFollowButton isFollowing={item.isFollowing} userId={item.id} />}
        </View>
      </HStack>
    </Pressable>
  )
}
