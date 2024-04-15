import type { NoteItem } from '@server/modules/note/note'
import { Link, useRouter } from 'expo-router'
import { NoteLikeButton } from '@/ui/components/note/NoteLikeButton'
import { NoteCollectButton } from '@/ui/components/note/NoteCollectButton'
import { NoteShareButton } from '@/ui/components/note/NoteShareButton'
import { NoteCommentButton } from '@/ui/components/note/NoteCommentButton'
import { ImageCarousel } from '@/ui/components/ImageCarousel'
import { formatTime } from '@/utils/date'
import { Avatar, Card, HStack, Image, MyView, Paragraph, Text, VStack } from '@/ui'

export function DynamicListItem({ item }: { item: NoteItem }): React.ReactNode {
  const router = useRouter()

  const handlePressBackground = () => {
    router.push(`/note/${item.id}`)
  }

  return (
    <View className="relative mx-2 my-2 p-2 gap-2 rounded-md">
      <Card size="$3">
        <Card.Header>
          <HStack mx="$1" jc="space-between" ai="center">
            <UserAvatar item={item} />
            <NoteShareButton item={item} />
          </HStack>
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
          <VStack width="100%" gap="$2">
            <Paragraph size="md" numberOfLines={2} ellipsizeMode="tail">
              {item.title}
            </Paragraph>
            <HStack gap="$2.5" ai="center">
              <HStack flex={1} jc="flex-end" ai="center" gap="$2.5">
                <NoteLikeButton size={20} color="$gray10" item={item} placeholder="喜欢" />
                <NoteCollectButton size={20} color="$gray10" item={item} placeholder="收藏" />
                <NoteCommentButton size={20} color="$gray10" item={item} />
              </HStack>
            </HStack>
          </VStack>
        </Card.Footer>
      </Card>
    </View>
  )
}

function UserAvatar({ item }: { item: NoteItem }): React.ReactNode {
  return (
    <Link href={`/user/${item.user.id}/profile`} asChild>
      <HStack gap="$2.5" ai="center">
        <Avatar borderRadius="$full" size="$2">
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
