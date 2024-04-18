import type { ReactNode } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { useRouter } from 'expo-router'
import type { BaseUserInfo } from '@server/modules/user/user'
import { Avatar, AvatarImage, Box, Card, HStack, Heading, Image, Pressable, Text, View } from '@gluestack-ui/themed'
import type { GestureResponderEvent } from 'react-native'
import { useModal } from '../CustomModal'
import { NoteSheet } from './NoteSheet'
import { NoteLikeButton } from './NoteLikeButton'

export function NoteListItem(item: NoteItem): ReactNode {
  const router = useRouter()
  const modal = useModal()

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

  const handleLongPress = (ev: GestureResponderEvent) => {
    modal.present()
  }

  function UserAvatar({ user }: { user: BaseUserInfo }): ReactNode {
    return (
      <Pressable onPress={goToUser}>
        <HStack gap="$2" alignItems="center">
          <Avatar size="xs" borderRadius="$full" overflow="hidden">
            <AvatarImage
              source={{ uri: user.avatar! }}
              alt="avatar"
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
    <Pressable
      delayLongPress={300}
      onLongPress={handleLongPress}
      onPress={goToNote}
      style={({ pressed }) => [
        { flex: 1 },
      ]}
    >
      <Card
        p="$0"
        m="$1"
        borderRadius={6}
        maxWidth={360}
        variant="filled"
        $dark-bg="$backgroundDarkMuted"
      >
        <Image
          source={{ uri: item.cover.src }}
          h={200}
          w="$full"
          borderTopLeftRadius={6}
          borderTopRightRadius={6}
          alt="image"
        />
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

        <NoteSheet ref={modal.ref} item={item} />
      </Card>
    </Pressable>

  )
}
