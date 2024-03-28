import type { NoteItem } from '@server/modules/note/note'
import { PencilLine } from '@tamagui/lucide-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { CommentModel } from '@/ui/components/comment/CommentModel'
import { NoteCollectButton } from '@/ui/components/note/NoteCollectButton'
import { NoteLikeButton } from '@/ui/components/note/NoteLikeButton'
import { Input, View, XStack, YStack } from '@/ui'
import { useCommentModalOpen, useParentComment } from '@/atoms/comment'

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
          <XStack py="$2" pb={bottom || '$2'} mx="$2" gap="$3">
            <XStack flex={1} gap="$1" ai="center" bg="$gray3" px="$2.5" py="$1.5" br={50}>
              <PencilLine size="$1" color="gray" />
              <Input
                flex={1}
                size="$2"
                placeholder="说点什么"
                onPressIn={handleOpenCommentModal}
                unstyled
              />
            </XStack>
            <XStack gap="$2">
              <NoteLikeButton size={18} item={item} placeholder="喜欢" />
              <NoteCollectButton size={18} item={item} />
            </XStack>
          </XStack>
          )
        : (
          <YStack fullscreen>
            <View
              flex={1}
              opacity={0.3}
              pointerEvents="none"
              bg="$gray8"
              onPress={() => setOpen(false)}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <CommentModel item={item}></CommentModel>
            </KeyboardAvoidingView>
          </YStack>
          )}
    </>
  )
}
