import type { NoteItem } from '@server/modules/note/note'
import { Link, useRouter } from 'expo-router'
import { NoteLikeButton } from '@/ui/components/note/NoteLikeButton'
import { NoteCollectButton } from '@/ui/components/note/NoteCollectButton'
import { NoteShareButton } from '@/ui/components/note/NoteShareButton'
import { NoteCommentButton } from '@/ui/components/note/NoteCommentButton'
import { ImageCarousel } from '@/ui/components/ImageCarousel'
import { formatTime } from '@/utils/date'
import { Avatar, Card, Image, Paragraph, SizableText, XStack, YStack } from '@/ui'

export function DynamicListItem({ item }: { item: NoteItem }): React.ReactNode {
  const router = useRouter()

  const handlePressBackground = () => {
    router.push(`/note/${item.id}`)
  }

  return (
    <YStack position="relative" mx="$2.5" my="$2" p="$1.5" gap="$2" br="$4">
      <Card size="$3">
        <Card.Header>
          <XStack mx="$1" jc="space-between" ai="center">
            <UserAvatar item={item} />
            <NoteShareButton item={item} />
          </XStack>
        </Card.Header>
        <Card.Background unstyled onPress={handlePressBackground}>
          {/* <ImageCarousel
            height={350}
            data={item?.images.map(image => image.src)}
          /> */}

          <Image
            width="100%"
            minHeight={150}
            source={{ uri: item?.cover.src }}
            resizeMode="cover"
          />
        </Card.Background>
        <Card.Footer p="$2.5">
          <YStack width="100%" gap="$2">
            <Paragraph fontSize={16} numberOfLines={2} ellipsizeMode="tail">
              {item.title}
            </Paragraph>
            <XStack gap="$2.5" ai="center">
              <XStack flex={1} jc="flex-end" ai="center" gap="$2.5">
                <NoteLikeButton size={20} color="$gray10" item={item} placeholder="喜欢" />
                <NoteCollectButton size={20} color="$gray10" item={item} placeholder="收藏" />
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
      <XStack gap="$2.5" ai="center">
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
