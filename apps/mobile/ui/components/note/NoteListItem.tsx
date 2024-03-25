import type { NoteItem } from '@server/modules/note/note'
import { Link, useRouter } from 'expo-router'
import type { BaseUserInfo } from '@server/modules/user/user'
import { Check } from '@tamagui/lucide-icons'
import { useId, useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { NoteSheet } from './NoteSheet'
import { NoteLikeButton } from './NoteLikeButton'
import { historyStateAtoms } from '@/atoms/history'
import { useSheetOpen } from '@/atoms/sheet'
import { Avatar, Card, Checkbox, CheckedState, Image, Paragraph, SizableText, View, XStack, YStack, useTheme } from '@/ui'

export function NoteListItem(item: NoteItem): React.ReactNode {
  const theme = useTheme()
  const router = useRouter()
  const [_, setSheetOpen] = useSheetOpen()

  const id = useId()

  const isManageMode = useAtomValue(historyStateAtoms.isManageMode)
  const [selectedItems, setSelectedItems] = useAtom(historyStateAtoms.selectedItems)
  const items = useAtomValue(historyStateAtoms.items)
  const setSelectAll = useSetAtom(historyStateAtoms.selectAll)

  const [checked, setChecked] = useState<CheckedState>(selectedItems.includes(item.id))

  const handlePressBackground = () => {
    if (!isManageMode) {
      router.push(`/note/${item.id}`)
    }
    else {
      setChecked(!checked)

      if (checked) {
        setSelectedItems((prevState) => {
          if (prevState.includes(item.id))
            return prevState.filter(selectedItem => selectedItem !== item.id)
          else
            return [...prevState, item.id]
        })
      }

      const allSelected = items.every(item => selectedItems.includes(item))
      setSelectAll(allSelected)
    }
  }

  const handleLongPress = () => {
    if (!isManageMode)
      setSheetOpen(true)
  }

  return (
    <YStack position="relative" p="$1.5" flex={1} gap="$2" br="$4">
      <Card size="$4" bg="$color2">
        <Card.Background unstyled onLongPress={handleLongPress} onPress={handlePressBackground}>
          <Image
            borderTopLeftRadius="$4"
            borderTopRightRadius="$4"
            width="100%"
            minHeight={200}
            source={{ uri: item.cover.src }}
            resizeMode="cover"
            alignSelf="center"
          />
          {
            isManageMode && (
              <View position="absolute" top="$2" right="$2">
                <Checkbox
                  id={id}
                  size="$4"
                  bg={checked ? theme.$accent10?.get() : '$gray0'}
                  borderColor="white"
                  checked={checked}
                  onCheckedChange={checked => setChecked(checked)}
                >
                  <Checkbox.Indicator>
                    <Check color="white" />
                  </Checkbox.Indicator>
                </Checkbox>
              </View>
            )
          }
        </Card.Background>
        <Card.Footer p="$2.5">
          <YStack width="100%" gap="$2">
            <Paragraph fontSize={16} numberOfLines={2} ellipsizeMode="tail" onPress={handlePressBackground}>
              {item.title}
            </Paragraph>
            <XStack gap="$2.5" ai="center">
              <UserAvatar user={item.user} />
              <XStack flex={1} jc="flex-end" ai="center" gap="$1.5" opacity={0.7}>
                <NoteLikeButton item={item} />
              </XStack>
            </XStack>
          </YStack>
        </Card.Footer>
      </Card>
      <NoteSheet item={item} />
    </YStack>
  )
}

function UserAvatar({ user }: { user: BaseUserInfo }): React.ReactNode {
  return (
    <Link href={`/user/${user.id}/profile`} asChild>
      <XStack gap="$2.5" ai="center">
        <Avatar circular size="$1">
          <Avatar.Image
            width="100%"
            height="100%"
            // @ts-expect-error
            source={{
              uri: user.avatar,
              width: '100%',
              height: '100%',
            }}
          />
          <Avatar.Fallback />
        </Avatar>
        <SizableText fontSize={14} opacity={0.7}>
          {user.nickname}
        </SizableText>
      </XStack>
    </Link>
  )
}
