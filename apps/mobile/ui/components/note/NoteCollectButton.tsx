import { Star } from "@tamagui/lucide-icons"
import { Button, SizeTokens, Text, XStack } from "../.."
import { trpc } from "@/utils/trpc"
import { useState } from "react"
import { NoteItem } from "@server/modules/note/note"

export type Props = {
  item: NoteItem
  size?: SizeTokens
}

export const NoteCollectButton = ({
  item,
  size = 16
}: Props) => {
  const [collected, setCollected] = useState(item.interact.collected)
  const [collectedCount, setCollectedCount] = useState(item.interact.collectedCount)

  const { mutateAsync: collectNote } = trpc.collection.addItem.useMutation({})
  const { mutateAsync: deletacollectNote } = trpc.collection.deleteItem.useMutation({})

  const handleCollect = async () => {
    if (collected) {
      await deletacollectNote({ itemId: item.id })
    } else {
      await collectNote({ itemId: item.id })
    }

    setCollected(!collected)
    setCollectedCount(prevCount => collected ? prevCount - 1 : prevCount + 1)
  }

  return <XStack alignItems="center" gap='$1.5' onPressOut={handleCollect}>
    <Button
      icon={<Star
        fill={collected ? '#FDBC5F' : 'transparent'}
        color={collected ? '#FDBC5F' : 'gray'}
        size={size} />}
      unstyled>
    </Button>
    <Text fontSize={14} color={'gray'}>
      {collectedCount || '收藏'}
    </Text>
  </XStack>
}
