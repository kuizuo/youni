import type { NoteItem } from '@server/modules/note/note'
import { PencilLine } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HStack, Pressable, Text, VStack, View } from '@gluestack-ui/themed'
import { useEffect } from 'react'
import { CommentBox } from '@/ui/components/comment/CommentBox'
import { NoteCollectButton } from '@/ui/components/note/NoteCollectButton'
import { NoteLikeButton } from '@/ui/components/note/NoteLikeButton'
import { useCommentBoxOpen, useParentComment } from '@/atoms/comment'
import { NoteCommentButton } from '@/ui/components/note/NoteCommentButton'

export function NoteFooter({ item, onOk }: { item: NoteItem, onOk?: () => void }) {
  const { bottom } = useSafeAreaInsets()
  const [open, setOpen] = useCommentBoxOpen()
  const [_, setParentComment] = useParentComment()

  const handleOpenCommentModal = () => {
    setOpen(true)
    setParentComment({} as any)
  }

  const onSuccess = () => {
    onOk?.()
  }

  useEffect(() => {
    return () => {
      setOpen(false)
    }
  }, [])

  return (
    <>
      {open
        ? (<CommentBox item={item} onSuccess={onSuccess} />)
        : (
          <HStack py="$2" pb={bottom || '$2'} mx="$2" gap="$3">
            <HStack
              flex={1}
              gap="$1"
              bg="$trueGray200"
              $dark-bg="$backgroundDark800"
              px="$2"
              py="$1"
              alignItems="center"
              borderRadius="$full"
            >
              <PencilLine color="gray" />

              <Pressable
                onPressIn={handleOpenCommentModal}
              >
                <Text size="sm" color="$secondary500">
                  说点什么吧
                </Text>
              </Pressable>

            </HStack>
            <HStack gap="$2">
              <NoteLikeButton size="lg" item={item} placeholder="喜欢" />
              <NoteCollectButton size="lg" item={item} />
              <NoteCommentButton size="lg" item={item} onPress={() => setOpen(true)} />
            </HStack>
          </HStack>
          )}
    </>
  )
}
