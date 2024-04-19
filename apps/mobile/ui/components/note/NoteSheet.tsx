import React from 'react'
import type { NoteItem } from '@server/modules/note/note'
import type { BottomSheetModal } from '@gorhom/bottom-sheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { Button, ButtonText, HStack, Heading, Pressable, Text, Toast, ToastTitle, View, useToast } from '@gluestack-ui/themed'
import * as Clipboard from 'expo-clipboard'
import { CustomModal } from '../CustomModal'
import { useAuth } from '@/utils/auth'

interface Props {
  item: NoteItem
  onClose?: () => void
}

export const NoteSheet = React.forwardRef<BottomSheetModal, Props>(
  ({ item, onClose }, ref) => {
    const { currentUser } = useAuth()
    const toast = useToast()

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

    const handleDelete = () => {
      // TODO: 删除笔记

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
                    <Button p="$2" flex={1} onPress={handleDelete}>
                      <ButtonText size="sm" textAlign="center">删除</ButtonText>
                    </Button>
                  </HStack>
                </BottomSheetView>
                )
          }
        </CustomModal>
      </View>
    )
  },
)
