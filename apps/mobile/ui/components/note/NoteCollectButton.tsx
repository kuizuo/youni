import { Star } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { HStack, Icon, Pressable, Text } from '@gluestack-ui/themed'
import { debounce } from 'lodash'
import { trpc } from '@/utils/trpc'

export interface Props {
  item: NoteItem
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xs' | undefined
  color?: string
  placeholder?: string
}

export function NoteCollectButton({
  item,
  size = 'md',
  color = 'gray',
  placeholder,
}: Props) {
  const [collected, setCollected] = useState(item.interact.collected)
  const [collectedCount, setCollectedCount] = useState(item.interact.collectedCount)

  const { mutateAsync: collectNote } = trpc.collection.addItem.useMutation({})
  const { mutateAsync: deleteCollectNote } = trpc.collection.deleteItem.useMutation({})

  const handleCollect = useCallback(debounce(async () => {
    if (collected)
      await deleteCollectNote({ itemId: item.id })
    else
      await collectNote({ itemId: item.id })

    setCollected(!collected)
    setCollectedCount(prevCount => collected ? prevCount - 1 : prevCount + 1)
  }, 300), [collected, item.id, collectNote, deleteCollectNote])

  return (
    <HStack alignItems="center" gap="$1">
      <Pressable onPress={handleCollect}>
        <Icon
          as={Star}
          fill={collected ? '$yellow500' : 'transparent'}
          color={collected ? '$yellow500' : color}
          size={size}
        />
      </Pressable>
      <Text size="sm" style={{ color }}>
        {collectedCount || placeholder || '收藏'}
      </Text>
    </HStack>
  )
}
