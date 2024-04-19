import React from 'react'
import type { NoteItem } from '@server/modules/note/note'
import type { BottomSheetModal } from '@gorhom/bottom-sheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { Button, ButtonText, HStack, Heading, Pressable, Text, Toast, ToastTitle, View, useToast } from '@gluestack-ui/themed'
import * as Clipboard from 'expo-clipboard'
import { CustomModal } from '../CustomModal'
import { CustomDialog, useDialog } from '../CustomDialog'
import { useAuth } from '@/utils/auth'
import { trpc } from '@/utils/trpc'

interface Props {
  item: NoteItem
  onClose?: () => void
}

export const NoteSheet = React.forwardRef<BottomSheetModal, Props>(
  ({ item, onClose }, ref) => {
    const { currentUser } = useAuth()
    const toast = useToast()

    const { isOpen, openDialog, closeDialog } = useDialog()

    const { isLoading, mutateAsync: deleteNote } = trpc.note.delete.useMutation()

    const handleCopyLink = async () => {
      const prefix = ''
      // FIXME: Error: Cannot find native module 'ExpoClipboard'
      // await Clipboard.setStringAsync(`${prefix}/note/${item.id}`)

      toast.show({
        placement: 'bottom',
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="accent" action="success">
              <ToastTitle>复制链接</ToastTitle>
            </Toast>
          )
        },
      })

      onClose?.()
    }

    const handleDelete = async () => {
      try {
        await deleteNote({ id: item.id })
        onClose?.()

        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="success">
                <ToastTitle>删除成功</ToastTitle>
              </Toast>
            )
          },
        })
      }
      catch (error) {
        toast.show({
          placement: 'top',
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="error">
                <ToastTitle>
                  删除失败
                  {error.message}
                </ToastTitle>
              </Toast>
            )
          },
        })
      }
    }

    return (
      <View flex={1}>
        <CustomModal
          ref={ref}
          snapPoints={[250]}
        >
          {
            currentUser.id !== item.user.id
              ? (
                <BottomSheetView className="flex-1 px-4">
                  <Heading my="$2" size="sm">不感兴趣</Heading>
                  <HStack mt="$2" gap="$2">
                    <Pressable p="$2" flex={1} bg="$backgroundLight100" borderRadius="$md" onPress={() => { }}>
                      <Text size="sm" textAlign="center">不喜欢该笔记</Text>
                    </Pressable>
                    <Pressable p="$2" flex={1} bg="$backgroundLight100" onPress={() => { }}>
                      <Text size="sm" textAlign="center">不喜欢该作者</Text>
                    </Pressable>
                  </HStack>

                  <Heading my="$2" size="sm">反馈</Heading>
                  <HStack mt="$2" gap="$2">
                    <Pressable p="$2" flex={1} bg="$backgroundLight100" borderRadius="$md" onPress={() => { }}>
                      <Text size="sm" textAlign="center">广告</Text>
                    </Pressable>
                    <Pressable p="$2" flex={1} bg="$backgroundLight100" onPress={() => { }}>
                      <Text size="sm" textAlign="center">内容不适</Text>
                    </Pressable>
                  </HStack>
                </BottomSheetView>
                )
              : (
                <BottomSheetView className="flex-1 px-4">
                  <HStack mt="$2" gap="$2">
                    <Pressable p="$2" flex={1} bg="$backgroundLight100" borderRadius="$md" onPress={handleCopyLink}>
                      <Text size="sm" textAlign="center">复制链接</Text>
                    </Pressable>
                    <Pressable p="$2" flex={1} bg="$backgroundLight100" borderRadius="$md" onPress={() => { }}>
                      <Text size="sm" textAlign="center">编辑</Text>
                    </Pressable>
                    <CustomDialog
                      title="确认删除该笔记?"
                      isOpen={isOpen}
                      onClose={closeDialog}
                      onOk={handleDelete}
                    >
                      <Button p="$2" flex={1} onPress={() => openDialog()}>
                        <ButtonText size="sm" textAlign="center">删除</ButtonText>
                      </Button>
                    </CustomDialog>

                  </HStack>
                </BottomSheetView>
                )
          }
        </CustomModal>
      </View>
    )
  },
)
