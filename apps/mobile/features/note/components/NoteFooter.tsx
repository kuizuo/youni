import type { NoteItem } from '@server/modules/note/note'
import { PencilLine } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardAvoidingView, Platform, TextInput } from 'react-native'
import { HStack, Input, InputField, Pressable, VStack, View } from '@gluestack-ui/themed'
import { CommentModel } from '@/ui/components/comment/CommentModel'
import { NoteCollectButton } from '@/ui/components/note/NoteCollectButton'
import { NoteLikeButton } from '@/ui/components/note/NoteLikeButton'
import { useCommentModalOpen, useParentComment } from '@/atoms/comment'
import { NoteCommentButton } from '@/ui/components/note/NoteCommentButton'

export function NoteFooter({ item }: { item: NoteItem }) {
  const { bottom } = useSafeAreaInsets()
  const [open, setOpen] = useCommentModalOpen()
  const [_, setParentComment] = useParentComment()

  const handleOpenCommentModal = () => {
    setOpen(true)
    setParentComment({} as any)
  }

  return (
    <>
      {!open
        ? (
          <HStack py="$2" pb={bottom || '$2'} mx="$2" gap="$3">
            <HStack
              flex={1}
              gap="$1"
              bg="$trueGray200"
              px="$2"
              py="$1"
              alignItems="center"
              borderRadius="$full"
            >
              <PencilLine color="gray" />

              <Pressable
                onPressIn={handleOpenCommentModal}
              >
                <TextInput
                  placeholder="说点什么吧"
                />
              </Pressable>

            </HStack>
            <HStack gap="$2">
              <NoteLikeButton size="lg" item={item} placeholder="喜欢" />
              <NoteCollectButton size="lg" item={item} />
              <NoteCommentButton size="lg" item={item} />
            </HStack>
          </HStack>
          )
        : (
          <VStack>
            <Pressable
              flex={1}
              opacity={0.3}
              pointerEvents="none"
              bg="$secondary500"
              onPress={() => setOpen(false)}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <CommentModel item={item}></CommentModel>
            </KeyboardAvoidingView>
          </VStack>
          )}
    </>
  )
}
