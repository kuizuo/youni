import { Keyboard } from 'react-native'
import React, { ElementRef, useEffect, useRef, useState } from 'react'
import { CommentRefType } from '@server/modules/comment/comment.constant'
import type { NoteItem } from '@server/modules/note/note'
import { useSetAtom } from 'jotai'
import type { CommentItem } from '@server/modules/comment/comment'
import { newCommentsAtom, useCommentModalOpen, useParentComment } from '@/atoms/comment'
import { trpc } from '@/utils/trpc'
import { Button, Input, View, XStack, useToastController } from '@/ui'

interface Props {
  item: NoteItem
}

export function CommentModel({ item }: Props) {
  const { mutateAsync: comment } = trpc.comment.create.useMutation()

  const [open, setOpen] = useCommentModalOpen()
  const [parentComment, _] = useParentComment()

  const setComments = useSetAtom(newCommentsAtom)

  const toast = useToastController()
  const inputRef = useRef<ElementRef<typeof Input>>(null)
  const [content, setContent] = useState('')
  const [placeholder, setPlaceholder] = useState('')

  const handleComment = async () => {
    if (!content)
      return

    const result = await comment({ content, itemId: item.id, itemType: CommentRefType.Note, parentId: parentComment?.id })

    if (result) {
      toast.show('评论成功!')
      inputRef.current?.clear()
      setContent('')
      Keyboard.dismiss()
      setOpen(false)

      // 将评论添加到开头
      setComments(prev => [result as unknown as CommentItem, ...prev])
    }
  }

  useEffect(() => {
    if (parentComment?.id)
      setPlaceholder(`回复 @${parentComment.user.nickname}:`)
  }, [parentComment])

  return (
    <View height="$5" p="$3" bg="$background">
      <XStack flex={1} gap="$2">
        <Input
          ref={inputRef}
          flex={1}
          br="$6"
          size="$2"
          placeholder={placeholder}
          defaultValue={content}
          onChangeText={newText => setContent(newText)}
          onSubmitEditing={handleComment}
          autoFocus={open}
        />
        <Button size="$2" onPress={handleComment}>发送</Button>
      </XStack>
    </View>
  )
}
