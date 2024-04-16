import { Star } from 'lucide-react-native'
import { useState } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { HStack, Text } from '@gluestack-ui/themed'
import { TouchableOpacity } from '../Themed'
import { trpc } from '@/utils/trpc'

export interface Props {
  item: NoteItem
  size?: number
  color?: string
  placeholder?: string
}

export function NoteCollectButton({
  item,
  size = 16,
  color = 'gray',
  placeholder,
}: Props) {
  const [collected, setCollected] = useState(item.interact.collected)
  const [collectedCount, setCollectedCount] = useState(item.interact.collectedCount)

  const { mutateAsync: collectNote } = trpc.collection.addItem.useMutation({})
  const { mutateAsync: deletacollectNote } = trpc.collection.deleteItem.useMutation({})

  const handleCollect = async () => {
    if (collected)
      await deletacollectNote({ itemId: item.id })
    else
      await collectNote({ itemId: item.id })

    setCollected(!collected)
    setCollectedCount(prevCount => collected ? prevCount - 1 : prevCount + 1)
  }

  return (
    <HStack alignItems="center" gap="$1">
      <TouchableOpacity onPress={handleCollect}>
        <Star
          fill={collected ? '#FDBC5F' : 'transparent'}
          color={collected ? '#FDBC5F' : color}
          size={size}
        />
      </TouchableOpacity>
      <Text size="md" style={{ color }}>
        {collectedCount || placeholder || '收藏'}
      </Text>
    </HStack>

  )
}
