import { ArrowUpRightFromSquare } from 'lucide-react-native'
import type { NoteItem } from '@server/modules/note/note'
import React, { useCallback } from 'react'
import { Button, ButtonIcon, ButtonText, Divider, HStack, Icon, Pressable, ScrollView, Text } from '@gluestack-ui/themed'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { CustomModal, useModal } from '../CustomModal'
import { QQIcon, WechatIcon, WechatMomentIcon } from './assets/Icons/Social'

interface Props {
  item: NoteItem
}

interface ItemButton {
  onPress: () => void
  text: string
  icon: any
}

export function NoteMenu({ item }: Props) {
  const modal = useModal()

  const items: ItemButton[] = [
    {
      text: '微信',
      icon: WechatIcon,
      onPress: () => { },
    },
    {
      text: '朋友圈',
      icon: WechatMomentIcon,
      onPress: () => { },
    },
    {
      text: 'QQ',
      icon: QQIcon,
      onPress: () => { },
    },
  ]

  const ItemButton = ({
    text,
    icon,
    onPress,
  }: ItemButton) => {
    return (
      <Button flexDirection="column" action="secondary" variant="link" gap="$2" onPress={onPress}>
        <ButtonIcon as={icon} w="$12" h="$12" />
        <ButtonText textAlign="center" color="$trueGray500" size="sm">{text}</ButtonText>
      </Button>
    )
  }

  return (
    <>
      <Pressable onPress={() => modal.present()}>
        <Icon as={ArrowUpRightFromSquare} size="lg" />
      </Pressable>
      <CustomModal
        ref={modal.ref}
        snapPoints={[160]}
        title="分享至"
      >
        <BottomSheetView className="flex-1">
          <ScrollView horizontal>
            <HStack flex={1} mx="$6" my="$5" gap="$4">
              {
                items.map(item => (
                  <ItemButton key={item.text} {...item} />
                ))
              }
            </HStack>
          </ScrollView>
        </BottomSheetView>
        <Divider />
      </CustomModal>
    </>
  )
}
