import type { ReactNode } from 'react'
import { Avatar, AvatarImage, HStack, Text, View } from '@gluestack-ui/themed'
import { Pressable } from 'react-native'

interface Props {
  title: string
  desc?: string
  image: string
  onPress?: () => void
}

export function NotificationItem({ title, desc, image, onPress }: Props): ReactNode {
  return (
    <Pressable className="p-3 gap-3 h-8 items-center" onPress={onPress}>
      <Avatar size="lg">
        <AvatarImage
          source={{
            uri: image,
          }}
        />
      </Avatar>
      <View flex={1}>
        <HStack gap="$2">
          <Text size="md">
            {title}
          </Text>
        </HStack>

        <Text size="sm" color="gray">
          {desc}
        </Text>
      </View>
    </Pressable>
  )
}
