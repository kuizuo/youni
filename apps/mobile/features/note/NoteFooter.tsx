
import { CommentModel } from '@/ui/components/comment/CommentModel'
import { NoteCollectButton } from '@/ui/components/note/NoteCollectButton'
import { NoteLikeButton } from '@/ui/components/note/NoteLikeButton'
import { Input, XStack, YStack, View } from '@/ui'
import { NoteItem } from '@server/modules/note/note'
import { useCommentModalOpen, useParentComment } from '@/atoms/comment'
import { PencilLine } from '@tamagui/lucide-icons'

export const NoteFooter = ({ item }: { item: NoteItem }) => {

  const [open, setOpen] = useCommentModalOpen()
  const [_, setParentComment] = useParentComment()

  const handleOpenCommentModal = () => {
    setOpen(true)
    setParentComment({} as any)
  }

  return <>
    {!open ?
      <XStack padding='$2.5' marginHorizontal="$2" gap="$3">
        <XStack flex={1} gap="$1" alignItems='center' backgroundColor={'$gray3'} paddingHorizontal='$2.5' paddingVertical='$1.5' borderRadius={50}>
          <PencilLine size='$1' color={'gray'} />
          <Input
            flex={1} size="$2"
            placeholder={`说点什么`}
            onPressIn={handleOpenCommentModal}
            unstyled
          />
        </XStack>
        <XStack gap='$3'>
          <NoteLikeButton size={18} item={item} />
          <NoteCollectButton size={18} item={item} />
        </XStack>
      </XStack>
      : <>
        <YStack fullscreen onPress={() => setOpen(false)} >
          <View
            flex={1}
            opacity={0.3}
            pointerEvents={'none'}
            backgroundColor={'$gray8'}
            onPress={() => setOpen(false)}
          />
          <CommentModel item={item}></CommentModel>
        </YStack>
      </>}
  </>
}