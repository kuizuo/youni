import type { Campus } from '@youni/database'
import { Badge, BadgeText, HStack, Image, Text, View } from '@gluestack-ui/themed'
import { useAuth } from '@/utils/auth'

export function CampusTitle({ campus }: { campus?: Campus }) {
  if (!campus)
    return <Text>请选择校区</Text>

  const { currentUser } = useAuth()

  return (
    <View flexDirection="row" alignItems="center">
      <HStack alignItems="center" gap="$2">
        <Image
          w={24}
          h={24}
          source={{ uri: campus.logo }}
          resizeMode="contain"
          alt="image"
        />
        <Text size="lg">{campus.name}</Text>
      </HStack>
      {campus.id === currentUser.campusId && (
        <Badge
          ml="$1"
          size="sm"
          variant="solid"
          borderRadius="$none"
          action="info"
        >
          <BadgeText>本校区</BadgeText>
        </Badge>
      )}
    </View>
  )
}
