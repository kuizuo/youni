import type { NoteItem } from '@server/modules/note/note'
import { Avatar, Card, Paragraph, XStack, YStack, Image, Text } from '@/ui'
import { useRouter } from 'expo-router'
import { NoteLikeButton } from './NoteLikeButton'

export const NoteListItem = (item: NoteItem): React.ReactNode => {
  const router = useRouter()

  const handleNavigateToNote = () => {
    router.push(`/note/${item.id}`)
  }

  const UserAvatar = (): React.ReactNode => {
    const handleNavigateToUser = () => {
      router.push(`/user/${item.user.id}/profile`)
    }

    return <XStack gap='$2.5' alignItems='center' onPress={handleNavigateToUser}>
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
      <Text fontSize={14} opacity={0.7} >
        {item.user.nickname}
      </Text>
    </XStack>
  }

  return (
    <YStack position='relative' padding='$2' flex={1} gap="$2" borderRadius="$4">
      <Card size="$4" backgroundColor={'$color2'}>
        <Card.Background unstyled onPress={handleNavigateToNote} >
          <Image
            borderTopLeftRadius='$4'
            borderTopRightRadius='$4'
            width="100%"
            minHeight={240}
            source={{ uri: item.cover.src }}
            resizeMode="cover"
            alignSelf="center"
          />
        </Card.Background>
        <Card.Footer padding="$2.5">
          <YStack width={'100%'} gap='$2'>
            <Paragraph fontSize={16} numberOfLines={2} ellipsizeMode="tail" onPress={handleNavigateToNote} >
              {item.title}
            </Paragraph>
            <XStack gap='$2.5' alignItems='center'>
              <UserAvatar></UserAvatar>
              <XStack flex={1} justifyContent='flex-end' alignItems='center' gap="$1.5" opacity={0.7}>
                <NoteLikeButton item={item} />
              </XStack>
            </XStack>
          </YStack>
        </Card.Footer>
      </Card>
    </YStack>
  )
}
