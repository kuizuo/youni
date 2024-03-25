import type { NoteItem } from '@server/modules/note/note'
import { Link, useRouter } from 'expo-router'
import { NoteLikeButton } from '../note/NoteLikeButton'
import { NoteCollectButton } from '../note/NoteCollectButton'
import { NoteShareButton } from '../note/NoteShareButton'
import { NoteCommentButton } from '../note/NoteCommentButton'
import { formatTime } from '@/utils/date'
import { Avatar, Card, Image, Paragraph, SizableText, XStack, YStack, useTheme } from '@/ui'

export function UserNoteListItem(item: NoteItem): React.ReactNode {
  const theme = useTheme()
  const router = useRouter()

  const handlePressBackground = () => {
    router.push(`/note/${item.id}`)
  }

  return (
    <YStack position="relative" margin="$2.5" padding="$1.5" gap="$2" borderRadius="$4">
      <Card size="$3">
        <Card.Header>
          <XStack marginHorizontal="$1" justifyContent="space-between" alignItems="center">
            <UserAvatar item={item} />
            <NoteShareButton item={item} />
          </XStack>
        </Card.Header>
        <Card.Background unstyled onPress={handlePressBackground}>
          <Image
            width="100%"
            minHeight={350}
            source={{ uri: item.cover.src }}
            resizeMode="cover"
          />
        </Card.Background>
        <Card.Footer padding="$2.5">
          <YStack width="100%" gap="$2">
            <Paragraph fontSize={16} numberOfLines={2} ellipsizeMode="tail">
              {item.title}
            </Paragraph>
            <XStack gap="$2.5" alignItems="center">
              <XStack flex={1} justifyContent="flex-end" alignItems="center" gap="$2.5">
                <NoteLikeButton size={20} color="$gray10" item={item} />
                <NoteCollectButton size={20} color="$gray10" item={item} />
                <NoteCommentButton size={20} color="$gray10" item={item} />
              </XStack>
            </XStack>
          </YStack>
        </Card.Footer>
      </Card>
    </YStack>
  )
}

function UserAvatar({ item }: { item: NoteItem }): React.ReactNode {
  return (
    <Link href={`/user/${item.user.id}/profile`} asChild>
      <XStack gap="$2.5" alignItems="center">
        <Avatar circular size="$2">
          <Avatar.Image
            width="100%"
            height="100%"
          // @ts-expect-error
            source={{
              uri: item.user.avatar,
              width: '100%',
              height: '100%',
            }}
          />
          <Avatar.Fallback />
        </Avatar>
        <XStack gap="$2">
          <SizableText fontSize={16}>{item.user.nickname}</SizableText>
          <SizableText>{' · '}</SizableText>
          <SizableText fontSize={12} opacity={0.7}>{formatTime(item.publishTime)}</SizableText>
        </XStack>
      </XStack>
    </Link>
  )
}
