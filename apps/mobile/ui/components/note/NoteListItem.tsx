import type { NoteItem } from '@server/modules/note/note'
import { Avatar, Card, Paragraph, XStack, YStack, Image, Text, SizableText, Sheet, ScrollView, Button, Separator } from '@/ui'
import { Link, useRouter } from 'expo-router'
import { NoteLikeButton } from './NoteLikeButton'
import { BaseUserInfo } from '@server/modules/user/user'
import { useSheetOpen } from '@/atoms/sheet'
import { ChevronDown } from '@tamagui/lucide-icons'

export const NoteListItem = (item: NoteItem): React.ReactNode => {
  const router = useRouter()
  const [open, setOpen] = useSheetOpen()

  const handleNavigateToNote = () => {
    router.push(`/note/${item.id}`)
  }

  const handleLongPress = () => {
    setOpen(true)
  }

  return (
    <YStack position='relative' padding='$1.5' flex={1} gap="$2" borderRadius="$4">
      <Card size="$4" backgroundColor={'$color2'}>
        <Card.Background unstyled onLongPress={handleLongPress} onPress={handleNavigateToNote} >
          <Image
            borderTopLeftRadius='$4'
            borderTopRightRadius='$4'
            width="100%"
            minHeight={200}
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
              <UserAvatar user={item.user} />
              <XStack flex={1} justifyContent='flex-end' alignItems='center' gap="$1.5" opacity={0.7}>
                <NoteLikeButton item={item} />
              </XStack>
            </XStack>
          </YStack>
        </Card.Footer>
      </Card>
      <NoteSheet />
    </YStack>
  )
}

const NoteSheet = (): React.ReactNode => {
  const [open, setOpen] = useSheetOpen()

  return (
    <>
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[30]}
        snapPointsMode={'percent'}
        dismissOnSnapToBottom
        position={0}
        zIndex={100_000}
        animation="medium"
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 50 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" gap="$5">
          <ScrollView
            maxHeight={250}
            backgroundColor="$background"
            padding="$4"
            borderRadius="$4">
            <XStack gap="$4">
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
            </XStack>
          </ScrollView>
          <Separator />

        </Sheet.Frame>
      </Sheet>
    </>
  )
}

const UserAvatar = ({ user }: { user: BaseUserInfo }): React.ReactNode => {
  return <Link href={`/user/${user.id}/profile`} asChild>
    <XStack gap='$2.5' alignItems='center' >
      <Avatar circular size="$1">
        <Avatar.Image
          width="100%"
          height="100%"
          // @ts-ignore
          source={{
            uri: user.avatar,
            width: '100%',
            height: '100%',
          }}
        />
        <Avatar.Fallback />
      </Avatar>
      <SizableText fontSize={14} opacity={0.7} >
        {user.nickname}
      </SizableText>
    </XStack>
  </Link>
}