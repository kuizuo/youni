import type { ReactNode } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { useRouter } from 'expo-router'
import type { BaseUserInfo } from '@server/modules/user/user'
import { NoteSheet } from './NoteSheet'
import { NoteLikeButton } from './NoteLikeButton'
import { useSheetOpen } from '@/atoms/sheet'
import { Avatar, Card, Image, Paragraph, SizableText, XStack, YStack } from '@/ui'

export function NoteListItem(item: NoteItem): ReactNode {
  const router = useRouter()
  const [_, setSheetOpen] = useSheetOpen()

  const goToNote = () => {
    router.push(`/note/${item.id}`)
  }

  const handleLongPress = () => {
    setSheetOpen(true)
  }

  function UserAvatar({ user }: { user: BaseUserInfo }): ReactNode {
    return (
      <XStack gap="$2.5" ai="center" onPress={goToNote}>
        <Avatar circular size="$1">
          <Avatar.Image
            width="100%"
            height="100%"
              // @ts-expect-error
            source={{
              uri: user.avatar,
              width: '100%',
              height: '100%',
            }}
          />
          <Avatar.Fallback />
        </Avatar>
        <SizableText fontSize={14} opacity={0.7}>
          {user.nickname}
        </SizableText>
      </XStack>
    )
  }

  return (
    <YStack position="relative" p="$1.5" flex={1} gap="$2" br="$4">
      <Card size="$4" bg="$color2">
        <Card.Background unstyled onLongPress={handleLongPress} onPress={goToNote}>
          <Image
            borderTopLeftRadius="$4"
            borderTopRightRadius="$4"
            width="100%"
            minHeight={200}
            source={{ uri: item.cover.src }}
            resizeMode="cover"
            alignSelf="center"
          />
        </Card.Background>
        <Card.Footer p="$2.5">
          <YStack width="100%" gap="$2">
            <Paragraph fontSize={16} numberOfLines={2} ellipsizeMode="tail" onPress={goToNote}>
              {item.title}
            </Paragraph>
            <XStack gap="$2.5" ai="center">
              <UserAvatar user={item.user} />
              <XStack flex={1} jc="flex-end" ai="center" gap="$1.5" opacity={0.7}>
                <NoteLikeButton item={item} />
              </XStack>
            </XStack>
          </YStack>
        </Card.Footer>
      </Card>
      <NoteSheet item={item} />
    </YStack>
  )
}
