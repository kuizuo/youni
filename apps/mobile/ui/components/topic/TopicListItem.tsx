import { useRouter } from 'expo-router'
import { Avatar, AvatarImage, HStack, Pressable, Text, VStack, View } from '@gluestack-ui/themed'
import type { NoteTag } from '@youni/database'
import { useAuth } from '@/utils/auth'

export function TopicListItem(item: NoteTag): React.ReactElement {
  const { currentUser } = useAuth()
  const router = useRouter()

  const handleNavigateToUser = () => {
    router.push(`/user/${item.id}/profile`)
  }

  return (
    <Pressable onPress={handleNavigateToUser}>
      <HStack p="$3" gap="$3" alignItems="center">
        <VStack flex={1}>
          <HStack gap="$2">
            <Text size="md">
              {/* {item.} */}
            </Text>
          </HStack>

          <Text size="sm" color="gray">
            浏览量
            {/* TODO: 笔记 · 1 | 粉丝 · 1 */}
          </Text>
        </VStack>

      </HStack>
    </Pressable>
  )
}
