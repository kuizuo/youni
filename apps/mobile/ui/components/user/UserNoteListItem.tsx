import type { NoteItem } from '@server/modules/note/note'
import { Link, useRouter } from 'expo-router'
import { Avatar, Card, HStack, Heading, Text, VStack } from '@gluestack-ui/themed'
import { NoteLikeButton } from '../note/NoteLikeButton'
import { NoteCollectButton } from '../note/NoteCollectButton'
import { NoteShareButton } from '../note/NoteShareButton'
import { NoteCommentButton } from '../note/NoteCommentButton'
import { ImageCarousel } from '../ImageCarousel'
import { formatTime } from '@/utils/date'

export function UserNoteListItem(item: NoteItem): React.ReactNode {
  const router = useRouter()

  const handlePressBackground = () => {
    router.push(`/note/${item.id}`)
  }

  return (
    <VStack position="relative" mx="$2.5" p="$1.5" gap="$2" br="$4">
      <Card size="$3">
        <Card.Header>
          <HStack mx="$1" justifyContent="space-between" alignItems="center">
            <UserAvatar item={item} />
            {/* <NoteShareButton item={item} /> */}
          </HStack>
        </Card.Header>
        <Card.Background unstyled onPress={handlePressBackground}>
          <ImageCarousel
            height={350}
            data={item?.images.map(image => image.src)}
          />

          {/* <Image
            width="100%"
            minHeight={350}
            source={{ uri: item.cover.src }}
            resizeMode="cover"
          /> */}
        </Card.Background>
        <Card.Footer p="$2.5">
          <VStack width="100%" gap="$2">
            <Heading size="md" numberOfLines={2} ellipsizeMode="tail">
              {item.title}
            </Heading>
            <HStack gap="$2.5" alignItems="center">
              <HStack flex={1} justifyContent="flex-end" alignItems="center" gap="$2.5">
                <NoteLikeButton size={20} color="$gray10" item={item} placeholder="喜欢" />
                <NoteCollectButton size={20} color="$gray10" item={item} placeholder="收藏" />
                <NoteCommentButton size={20} color="$gray10" item={item} />
              </HStack>
            </HStack>
          </VStack>
        </Card.Footer>
      </Card>
    </VStack>
  )
}

function UserAvatar({ item }: { item: NoteItem }): React.ReactNode {
  return (
    <Link href={`/user/${item.user.id}/profile`} asChild>
      <HStack gap="$2.5" alignItems="center">
        <Avatar borderRadius="$full" size="$2" overflow="hidden">
          <AvatarImage
            width="100%"
            height="100%"
          // @ts-expect-error
            source={{
              uri: item.user.avatar,
              width: '100%',
              height: '100%',
            }}
          />

        </Avatar>
        <HStack gap="$2">
          <Text size="md">{item.user.nickname}</Text>
          <Text>{' · '}</Text>
          <Text fontSize={12} opacity={0.7}>{formatTime(item.publishTime)}</Text>
        </HStack>
      </HStack>
    </Link>
  )
}
