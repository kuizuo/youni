import type { ReactNode } from 'react'
import { Avatar, SizableText, XStack, YStack } from '@/ui'

interface Props {
  title: string
  desc?: string
  image: string
  onPress?: () => void
}

export function NotificationItem({ title, desc, image, onPress }: Props): ReactNode {
  return (
    <XStack p="$3" gap="$3" height="$8" ai="center" onPress={onPress}>
      <Avatar circular size="$5">
        <Avatar.Image
          width="100%"
          height="100%"
          source={{
            uri: image,
          }}
        />
        <Avatar.Fallback />
      </Avatar>
      <YStack flex={1}>
        <XStack gap="$2">
          <SizableText size="$4">
            {title}
          </SizableText>
        </XStack>

        <SizableText size="$1" color="gray">
          {desc}
        </SizableText>
      </YStack>
    </XStack>
  )
}
