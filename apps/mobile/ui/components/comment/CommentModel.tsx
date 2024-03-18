
import { trpc } from "@/utils/trpc"
import { Keyboard } from 'react-native'
import { Button, Input, View, XStack, useToastController } from "@/ui"
import React, { ElementRef, useEffect, useRef, useState } from "react"
import { CommentRefType } from "@server/modules/comment/comment.constant"
import { NoteItem } from "@server/modules/note/note"
import { newCommentsAtom, useCommentModalOpen, useParentComment } from "@/atoms/comment"
import { useSetAtom } from "jotai"
import { CommentItem } from "@server/modules/comment/comment"

interface Props {
  item: NoteItem
}

export const CommentModel = ({ item }: Props) => {
  const { mutateAsync: comment } = trpc.comment.create.useMutation()

  const [open, setOpen] = useCommentModalOpen()
  const [parentComment, _] = useParentComment()

  const setComments = useSetAtom(newCommentsAtom)

  const toast = useToastController()
  const inputRef = useRef<ElementRef<typeof Input>>(null)
  const [content, setContent] = useState('')
  const [placeholder, setPlaceholder] = useState('')

  const handleComment = async () => {
    if (!content) {
      return
    }

    const result = await comment({ content, itemId: item.id, itemType: CommentRefType.Note, parentId: parentComment?.id })

    if (result) {
      toast.show('评论成功!')
      inputRef.current?.clear()
      setContent('')
      Keyboard.dismiss()
      setOpen(false)

      // 将评论添加到开头
      setComments((prev) => [result as unknown as CommentItem, ...prev])
    }
  }

  useEffect(() => {
    if (parentComment?.id) {
      setPlaceholder(`回复 @${parentComment.user.nickname}:`)
    }
  }, [parentComment])

  return <View height={'$5'} padding="$3" backgroundColor={'$background'}>
    <XStack flex={1} gap='$2'>
      <Input ref={inputRef}
        flex={1}
        borderRadius={'$6'}
        size="$2"
        placeholder={placeholder}
        defaultValue={content}
        onChangeText={newText => setContent(newText)}
        onSubmitEditing={handleComment}
        autoFocus={open}
      />
      <Button size="$2" onPress={handleComment} >发送</Button>
    </XStack>
  </View>
}