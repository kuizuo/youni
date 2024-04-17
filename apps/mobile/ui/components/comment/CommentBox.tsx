import { Keyboard, KeyboardAvoidingView, Platform, TextInput } from 'react-native'
import type { ElementRef } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { CommentRefType } from '@server/modules/comment/comment.constant'
import type { NoteItem } from '@server/modules/note/note'
import { Button, ButtonText, HStack, Pressable, Toast, ToastTitle, VStack, View, useToast } from '@gluestack-ui/themed'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCommentBoxOpen, useParentComment } from '@/atoms/comment'
import { trpc } from '@/utils/trpc'

interface Props {
  item: NoteItem
  onSuccess: () => void
  onCancel?: () => void
}

const cacheContent: {
  text: string
  noteId?: string
  replyText?: string
  replyUserId?: string
} = {
  text: '',
}

export function CommentBox({
  item,
  onSuccess,
  onCancel,
}: Props) {
  const { bottom } = useSafeAreaInsets()
  const { isLoading, mutateAsync: comment } = trpc.comment.create.useMutation()

  const [open, setOpen] = useCommentBoxOpen()
  const [parentComment, _] = useParentComment()

  const toast = useToast()
  const inputRef = useRef<ElementRef<typeof TextInput>>(null)
  const [content, setContent] = useState('')
  const [placeholder, setPlaceholder] = useState('')

  function initContent() {
    if (cacheContent.noteId !== item.id) {
      Object.assign(cacheContent, {
        text: '',
      })
    }

    if (parentComment.user) {
      if (parentComment.user.id !== cacheContent.replyUserId) {
        setPlaceholder(`回复 @${parentComment.user.nickname}:`)

        Object.assign(cacheContent, {
          replyText: `回复 ${parentComment.user.nickname} `,
          replyUserId: parentComment.user.id,
        })
      }
    }
  }

  const handleComment = async () => {
    if (!content)
      return

    if (isLoading)
      return

    try {
      const result = await comment({
        itemId: item.id,
        itemType: CommentRefType.Note,
        content,
        parentId: parentComment?.id,
      })

      if (result) {
        inputRef.current?.clear()

        try {
          onSuccess()
          setContent('')
          setOpen(false)
          blur()
        }
        catch (error) {
          // empty
        }

        toast.show({
          placement: 'bottom',
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="suceess">
                <ToastTitle>发送成功</ToastTitle>
              </Toast>
            )
          },
        })
      }
    }
    catch (error) {
      toast.show({
        placement: 'bottom',
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="accent" action="error">
              <ToastTitle>发送失败</ToastTitle>
            </Toast>
          )
        },
      })
    }
  }

  const handleCancel = () => {
    onCancel?.()
    setOpen(false)
  }

  const [isKeyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true)
      },
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setOpen(false)
        setKeyboardVisible(false)
      },
    )

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  return (
    <>
      {/* FIXME:  */}
      <Pressable
        onPress={handleCancel}
        className="bg-opacity-10 absolute inset-0 z-20"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ zIndex: 10 }}
      >
        <View
          className="p-4 flex-row items-center rounded-t-[16px] overflow-hidden"
          bg="$backgroundLight200"
          $dark-bg="$backgroundDark200"
        >
          <HStack flex={1} alignItems="center" gap="$2">
            <TextInput
              ref={inputRef}
              className="flex-1 py-2 px-3 rounded-md bg-gray-300"
              multiline
              placeholder={placeholder}
              defaultValue={content}
              onChangeText={function handleSomeString(text) {
                setContent(text)

                // const isDeleting = text.length < content.length

                // if (
                //   !isDeleting
                //   && text.match(text.length === 1 ? /(@|＠)$/ : /\s(@|＠)$/)
                // ) {
                //   //
                //   return
                // }

                // const lastAtName = content.match(/(\s(@|＠)\w+)$/)?.[1]
                // const firstAtName = content.match(/((@|＠)\w+)$/)?.[1]

                // if (isDeleting && (lastAtName || firstAtName === content)) {
                //   if (lastAtName)
                //     setContent(text.slice(0, text.length - lastAtName.length + 1))
                //   else
                //     setContent('')
                // }
                // else {
                //   setContent(text)
                // }
              }}
              autoFocus={true}
              onFocus={() => {
                initContent()
                inputRef.current?.setNativeProps({
                  text: content,
                })
              }}
              autoCapitalize="none"
            />

            <Button className="self-end" size="xs" onPress={handleComment}>
              <ButtonText>
                {isLoading ? '发送中' : '发送'}
              </ButtonText>
            </Button>
          </HStack>
        </View>
      </KeyboardAvoidingView>
    </>
  )
}
