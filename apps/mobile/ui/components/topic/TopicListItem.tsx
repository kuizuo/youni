import { useRouter } from 'expo-router'
import { HStack, Pressable, Text } from '@gluestack-ui/themed'
import type { TagItem } from '@server/modules/tag/tag'
import { useAuth } from '@/utils/auth'

export function TopicListItem(item: TagItem & { viewCount: number }): React.ReactElement {
  const { currentUser } = useAuth()
  const router = useRouter()

  const handleNavigateToUser = () => {
    router.push(`/tag/${item.name}`)
  }

  return (
    <Pressable onPress={handleNavigateToUser}>
      <HStack p="$3" gap="$3" alignItems="center">
        <HStack flex={1} gap="$2" justifyContent="space-between">
          <Text size="md">
            #
            {' '}
            {item.name}
          </Text>

          <Text size="sm" color="$secondary500">
            {/* TODO: format value */}
            {item?.viewCount && (`${item.viewCount} 浏览`)}
          </Text>
        </HStack>
      </HStack>
    </Pressable>
  )
}
