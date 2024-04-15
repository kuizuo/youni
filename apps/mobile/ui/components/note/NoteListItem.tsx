import type { ReactNode } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { Link, useRouter } from 'expo-router'
import type { BaseUserInfo } from '@server/modules/user/user'
import { Avatar, AvatarImage, Box, Card, HStack, Heading, Image, LinkText, Text, View } from '@gluestack-ui/themed'
import { Pressable } from '../MyComponent'
import { NoteSheet } from './NoteSheet'
import { NoteLikeButton } from './NoteLikeButton'
import { useSheetOpen } from '@/atoms/sheet'

export function NoteListItem(item: NoteItem): ReactNode {
  const router = useRouter()
  const [_, setSheetOpen] = useSheetOpen()

  const goToNote = () => {
    router.push({
      pathname: `/note/[id]`,
      params: { id: item.id },
    })
  }

  const goToUser = () => {
    router.push({
      pathname: `/user/[id]/profile`,
      params: { id: item.user.id },
    })
  }

  const handleLongPress = () => {
    setSheetOpen(true)
  }

  function UserAvatar({ user }: { user: BaseUserInfo }): ReactNode {
    return (
      <Pressable onPress={goToNote}>
        <HStack gap="$2" alignItems="center">
          <Avatar size="xs" borderRadius="$full">
            <AvatarImage
              source={{
                uri: user.avatar!,
              }}
            />
          </Avatar>
          <Text size="xs" opacity={70}>
            {user.nickname}
          </Text>
        </HStack>
      </Pressable>
    )
  }

  return (
    <Card p="$0" m="$1" borderRadius={6} maxWidth={360}>
      <Pressable
        style={{ flex: 1 }}
        onLongPress={handleLongPress}
        onPress={goToNote}
      >
        <Image
          source={{ uri: item.cover.src }}
          h={200}
          w="$full"
          borderTopLeftRadius={6}
          borderTopRightRadius={6}
        />
      </Pressable>
      <View p="$2">
        <Heading
          size="xs"
          fontFamily="$heading"
          mb="$4"
          numberOfLines={2}
          ellipsizeMode="tail"
          onPress={goToNote}
        >
          {item.title}
        </Heading>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <UserAvatar user={item.user} />
          <NoteLikeButton item={item} />
        </Box>
      </View>

      {/* <NoteSheet item={item} /> */}
    </Card>
  )
}
