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
        <Avatar borderRadius="$full" size="lg" overflow="hidden">
          <AvatarImage
            source={{ uri: item.avatar }}
            alt="avatar"
            resizeMode="contain"
          />
        </Avatar>

        <VStack flex={1} h="$full" justifyContent="space-around">
          <HStack gap="$2">
            <Text size="md">
              {item.nickname}
            </Text>
          </HStack>

          <Text size="sm" color="$secondary500">
            {[
              item.interact.noteCount ? `笔记 · ${item.interact.noteCount}` : null,
              item.interact.followerCount ? `粉丝 · ${item.interact.followerCount}` : null,
            ]
              .filter(Boolean)
              .join(' | ') || item.desc}
          </Text>
        </VStack>

        <View>
          {currentUser?.id !== item.id && <UserFollowButton isFollowing={item.interact?.isFollowing} userId={item.id} />}
        </View>
      </HStack>
    </Pressable>
  )
}
