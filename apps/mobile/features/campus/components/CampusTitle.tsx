import type { Campus } from '@youni/database'
import { Image, Text, View } from '@gluestack-ui/themed'

export function CampusTitle({ campus }: { campus?: Campus }) {
  if (!campus)
    return <Text>请选择校区</Text>

  return (
    <View flexDirection="row" alignItems="center" gap="$2">
      <Image
        w={24}
        h={24}
        source={{ uri: campus.logo }}
        resizeMode="contain"
      />
      <Text size="lg">{campus.name}</Text>
    </View>
  )
}
