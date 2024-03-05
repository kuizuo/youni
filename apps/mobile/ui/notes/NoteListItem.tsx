import type { InteractedNoteItem } from '@server/modules/note/note'
import { Avatar, Card, Paragraph, XStack, YStack, Image, Text } from '@/ui'
import { Link, useRouter } from 'expo-router'
import { NoteLikeButton } from '../components/LikeButton'

export const NoteListItem = (item: InteractedNoteItem): React.ReactElement => {
  const router = useRouter()

  const goToNote = () => {
    router.push(`/note/${item.id}`)
  }

  return (
    <YStack position='relative' padding='$2' flex={1} gap="$2" borderRadius="$4">
      <Card size="$4" width={'100%'} backgroundColor={'$color1'}>
        <Card.Background unstyled onPress={() => goToNote()} >
          <Image
            borderRadius={'$2'}
            width="100%"
            minHeight={200}
            source={{ height: item.title.includes('标题') ? 200 : 300, uri: item.imageList[0] }}
            resizeMode="cover"
            alignSelf="center"
          />
        </Card.Background>
        <Card.Footer padding="$3">
          <YStack width={'100%'} gap='$2'>
            <Paragraph fontSize={16} numberOfLines={2} ellipsizeMode="tail" onPress={() => goToNote()} >
              {item.title}
            </Paragraph>
            <XStack gap='$2.5' alignItems='center'>
              <Avatar circular size="$1">
                <Avatar.Image
                  width="100%"
                  height="100%"
                  // @ts-ignore
                  source={{
                    uri: item?.user.avatar!,
                    width: '100%',
                    height: '100%',
                  }}
                />
                <Avatar.Fallback />
              </Avatar>
              <Link href={`/user/${item.user.id}`} asChild>
                <Text fontSize={14} opacity={0.7} >
                  {item.user.nickname}
                </Text>
              </Link>
              <XStack flex={1} justifyContent='flex-end' alignItems='center' gap="$1.5" opacity={0.7}>
                <NoteLikeButton
                  liked={item.interactInfo.liked}
                  likeCount={item.interactInfo.likeCount}
                  itemId={item.id}
                />
              </XStack>
            </XStack >
          </YStack>
        </Card.Footer>
      </Card>
    </YStack>
  )
}
