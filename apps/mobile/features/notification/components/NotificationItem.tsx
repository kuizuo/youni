import type { ReactNode } from 'react'
import { Image, Pressable, Text, VStack } from '@gluestack-ui/themed'

interface Props {
  title: string
  desc?: string
  image: string
  onPress?: () => void
}

export function NotificationItem({ title, desc, image, onPress }: Props): ReactNode {
  return (
    <Pressable flexDirection="row" p="$3" gap="$3" onPress={onPress}>
      <Image
        size="lg"
        width={60}
        height={60}
        source={image}
        alt="image"
      />
      <VStack flex={1} justifyContent="space-around">
        <Text size="md">
          {title}
        </Text>

        <Text size="sm" color="gray">
          {desc}
        </Text>
      </VStack>
    </Pressable>
  )
}
