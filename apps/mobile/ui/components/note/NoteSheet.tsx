import { ChevronDown } from 'lucide-react-native'
import type { NoteItem } from '@server/modules/note/note'
import { useSheetOpen } from '@/atoms/sheet'
import { Button, ScrollView, Separator, Sheet, XStack } from '@/ui'

interface Props {
  item: NoteItem
}

export function NoteSheet({ item }: Props): React.ReactNode {
  const [open, setOpen] = useSheetOpen()

  return (
    <>
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[30]}
        snapPointsMode="percent"
        dismissOnSnapToBottom
        position={0}
        zIndex={100_000}
        animation="medium"
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 50 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle />
        <Sheet.Frame p="$4" jc="center" ai="center" gap="$5">
          <ScrollView
            maxHeight={250}
            bg="$background"
            p="$4"
            br="$4"
          >
            <XStack gap="$4">
              <ChevronDown size="$1" />
            </XStack>
          </ScrollView>
          <Separator />

        </Sheet.Frame>
      </Sheet>
    </>
  )
}
