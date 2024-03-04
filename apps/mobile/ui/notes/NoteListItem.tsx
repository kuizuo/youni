import type { NoteItem } from '@server/modules/note/note'
import { Avatar, Card, Paragraph, XStack, YStack, Image, Button, Text } from '@/ui'
import { Heart } from '@tamagui/lucide-icons'
import { Link, useRouter } from 'expo-router'

export const NoteListItem = (item: NoteItem): React.ReactElement => {

  const router = useRouter()

  const goToNote = () => {
    router.push(`/note/${item.id}`)
  }

  return (
    <YStack position='relative' padding={4} flex={1} gap="$2" borderRadius="$2">
      <Card size="$4" width={'100%'} onPress={() => goToNote()} >
        <Card.Background unstyled>
          <Image
            borderRadius={'$2'}
            width="100%"
            minHeight={200}
            source={{ height: item.title.includes('标题') ? 200 : 300, uri: item.imageList[0] }}
            resizeMode="cover"
            alignSelf="center"
          />
        </Card.Background>
        <Card.Footer padded paddingHorizontal="$3">
          <YStack width={'100%'} gap='$2'>
            <Paragraph fontSize={16} numberOfLines={2} ellipsizeMode="tail">
              {item.title}
            </Paragraph>
            <XStack gap='$2.5' alignItems='center'>
              <Avatar circular size="$2">
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
                <Button
                  icon={<Heart
                    fill={item.interfaceInfo?.liked ? 'red' : 'transparent'}
                    color={item.interfaceInfo?.liked ? 'red' : '$color'}
                    size="$1" />}
                  onPress={() => {
                    alert('点赞了')
                  }}
                  unstyled>
                </Button>
                <Text >
                  10
                  {/* {item.interactInfo.likeCount} */}
                </Text>
              </XStack>
            </XStack >
          </YStack>
        </Card.Footer>
      </Card>
    </YStack>
  )
}
