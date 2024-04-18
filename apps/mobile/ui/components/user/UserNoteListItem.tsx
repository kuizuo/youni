import type { NoteItem } from '@server/modules/note/note'
import { Link, useRouter } from 'expo-router'
import { Avatar, AvatarImage, Card, HStack, Heading, Image, Pressable, Text, VStack, View } from '@gluestack-ui/themed'
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
    <VStack position="relative" mx="$1.5" p="$1.5" gap="$2" borderRadius="$sm">
      <Card
        p="$0"
        $dark-bg="$backgroundDarkMuted"
      >
        <HStack p="$2" justifyContent="space-between" alignItems="center">
          <UserAvatar item={item} />
          <NoteShareButton item={item} />
        </HStack>

        <Pressable
          flex={1}
          onPress={handlePressBackground}
        >
          <Image
            height={150}
            source={{ uri: item?.cover.src }}
            style={{
              width: '100%',
            }}
            resizeMode="cover"
          />
        </Pressable>
        <View p="$2.5">
          <VStack width="100%" gap="$2">
            <Heading size="md" numberOfLines={2} ellipsizeMode="tail">
              {item.title}
            </Heading>
            <HStack gap="$2.5" alignItems="center">
              <HStack flex={1} justifyContent="flex-end" alignItems="center" gap="$2.5">
                <NoteLikeButton item={item} placeholder="喜欢" />
                <NoteCollectButton item={item} placeholder="收藏" />
                <NoteCommentButton item={item} />
              </HStack>
            </HStack>
          </VStack>
        </View>
      </Card>
    </VStack>
  )
}
function UserAvatar({ item }: { item: NoteItem }): React.ReactNode {
  return (
    <Link href={`/user/${item.user.id}/profile`} asChild>
      <HStack gap="$2.5" alignItems="center">
        <Avatar borderRadius="$full" size="sm" bg="white" overflow="hidden">
          <AvatarImage
            source={{ uri: item.user.avatar }}
            resizeMode="contain"
          />
        </Avatar>
        <HStack alignItems="center" gap="$1.5">
          <Text size="md">{item.user.nickname}</Text>
          <Text>·</Text>
          <Text fontSize={12} opacity={0.7}>{formatTime(item.publishTime)}</Text>
        </HStack>
      </HStack>
    </Link>
  )
}
