import { Star } from 'lucide-react-native'
import { useState } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { vars } from 'nativewind'
import type { ColorTokens, SizeTokens } from '../..'
import { Button, MyText, MyView } from '../..'
import { Pressable } from '../MyComponent'
import { trpc } from '@/utils/trpc'

export interface Props {
  item: NoteItem
  size?: SizeTokens
  color?: ColorTokens
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
    <Pressable className="items-center gap-1.5" onPressOut={handleCollect}>
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
      <Text size="md" style={{ color }}>
        {collectedCount || placeholder || '收藏'}
      </Text>
    </Pressable>
  )
}
