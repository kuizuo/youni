import { Star } from "@tamagui/lucide-icons"
import { Button, SizeTokens, Text, XStack } from ".."
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
      deletacollectNote({ itemId: item.id })
    } else {
      collectNote({ itemId: item.id })
    }

    setCollected(!collected)
    setCollectedCount(collected ? collectedCount - 1 : collectedCount + 1)
  }

  return <XStack alignItems="center">
    <Button
      icon={<Star
        fill={collected ? '#FDBC5F' : 'transparent'}
        color={collected ? '#FDBC5F' : 'gray'}
        size={size} />}
      onPressOut={handleCollect}
      unstyled>
    </Button>
    <Text marginLeft="$1.5" fontSize={size} color={'gray'}>
      {collectedCount}
    </Text>
  </XStack>
}
