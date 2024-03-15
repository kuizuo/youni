
import { CommentRefType } from '@server/modules/comment/comment.constant'
import { CommentSheet } from '@/ui/components/comment/CommentSheet'
import { NoteCollectButton } from '@/ui/components/note/NoteCollectButton'
import { NoteLikeButton } from '@/ui/components/note/NoteLikeButton'
import { useRef, ElementRef, useState } from 'react'
import { Input, XStack } from 'tamagui'
import { NoteItem } from '@server/modules/note/note'
import { trpc } from '@/utils/trpc'

export const NoteFooter = ({ item }: { item: NoteItem }) => {
  const { mutateAsync: comment } = trpc.comment.create.useMutation()

  const inputRef = useRef<ElementRef<typeof Input>>(null)
  const [content, setContent] = useState('')
  const handleComment = async () => {
    if (!content) {
      return
    }

    await comment({ content, itemId: item.id, itemType: CommentRefType.Note })
    setContent('')
    inputRef.current!.clear()
  }

  return <XStack padding='$2.5' marginHorizontal="$2" gap="$3">
    <Input ref={inputRef}
      flex={1} size="$3"
      placeholder={``}
      onChangeText={newText => setContent(newText)}
      onSubmitEditing={handleComment}
      borderRadius={'$10'}
    />
    <XStack gap='$3'>
      <NoteLikeButton size={18} item={item} />
      <NoteCollectButton size={18} item={item} />
    </XStack>
    <CommentSheet item={item}></CommentSheet>
  </XStack>
}