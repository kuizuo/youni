import type { NoteItem } from '@server/modules/note/note'
import { Link, useRouter } from 'expo-router'
import { Avatar, AvatarImage, Card, HStack, Heading, Image, Pressable, Text, VStack, View, useToken } from '@gluestack-ui/themed'
import { useState } from 'react'
import { NoteLikeButton } from '@/ui/components/note/NoteLikeButton'
import { NoteCollectButton } from '@/ui/components/note/NoteCollectButton'
import { NoteShareButton } from '@/ui/components/note/NoteShareButton'
import { NoteCommentButton } from '@/ui/components/note/NoteCommentButton'
import { ImageCarousel } from '@/ui/components/ImageCarousel'
import { formatTime } from '@/utils/date'

export function DynamicListItem({ item }: { item: NoteItem }): React.ReactNode {
  const router = useRouter()
  const margin = useToken('space', '1')
  const handlePressBackground = () => {
    router.push(`/note/${item.id}`)
  }
  const [imageWidth, setImageWidth] = useState<number>(400)

  return (
    <View position="relative" m="$1" p="$0" gap="$2">
      <Card
        px="$0"
        py="$1"
        m="$1"
        $dark-bg="$backgroundDarkMuted"
      >
        <HStack p="$2" justifyContent="space-between" alignItems="center">
          <UserAvatar item={item} />
          <NoteShareButton item={item} />
        </HStack>

        <Pressable
          flex={1}
          onPress={handlePressBackground}
          onLayout={ev => setImageWidth(ev.nativeEvent.layout.width - margin * 2)}
        >
          {/* <ImageCarousel
            height={150}
            data={item?.images.map(image => image.src)}
            showProgress={false}
          /> */}
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
    </View>
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
