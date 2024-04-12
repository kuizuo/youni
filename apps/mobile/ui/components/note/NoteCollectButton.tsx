import { Star } from '@tamagui/lucide-icons'
import { useState } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import type { ColorTokens, SizeTokens } from '../..'
import { Button, Text, View } from '../..'
import { trpc } from '@/utils/trpc'
import tw from '@/utils/tw'

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
    <View style={tw`items-center gap-1.5`} onPressOut={handleCollect}>
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
      <Text style={tw`text-base text-[${color}]`}>
        {collectedCount || placeholder || '收藏'}
      </Text>
    </View>
  )
}
