import React from 'react'
import type { NoteItem } from '@server/modules/note/note'

import type { BottomSheetModal } from '@gorhom/bottom-sheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { HStack, Heading, Pressable, Text, View } from '@gluestack-ui/themed'
import { CustomModal } from '../CustomModal'

interface Props {
  item: NoteItem
}

export const NoteSheet = React.forwardRef<BottomSheetModal, Props>(
  ({ item }, ref) => {
    return (
      <View flex={1}>
        <CustomModal
          ref={ref}
          snapPoints={[250]}
        >
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
        </CustomModal>
      </View>
    )
  },
)
