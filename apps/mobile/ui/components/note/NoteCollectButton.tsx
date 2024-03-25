import { Star } from '@tamagui/lucide-icons'
import { useState } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import type { ColorTokens, SizeTokens } from '../..'
import { Button, Text, XStack } from '../..'
import { trpc } from '@/utils/trpc'

export interface Props {
  item: NoteItem
  size?: SizeTokens
  color?: ColorTokens
}

export function NoteCollectButton({
  item,
  size = 16,
  color = 'gray',
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
    <XStack ai="center" gap="$1.5" onPressOut={handleCollect}>
      <Button
        icon={(
          <Star
            fill={collected ? '#FDBC5F' : 'transparent'}
            color={collected ? '#FDBC5F' : color}
            size={size}
          />
        )}
        unstyled
      >
      </Button>
      <Text fontSize={14} color={color}>
        {collectedCount || '收藏'}
      </Text>
    </XStack>
  )
}
