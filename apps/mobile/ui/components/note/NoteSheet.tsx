import { useSheetOpen } from "@/atoms/sheet"
import { ChevronDown } from "@tamagui/lucide-icons"
import { Sheet, XStack, Separator, ScrollView, Button } from "@/ui"
import { NoteItem } from "@server/modules/note/note"

interface Props {
  item: NoteItem
}

export const NoteSheet = ({ item }: Props): React.ReactNode => {
  const [open, setOpen] = useSheetOpen()

  return (
    <>
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[30]}
        snapPointsMode={'percent'}
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
        <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" gap="$5">
          <ScrollView
            maxHeight={250}
            backgroundColor="$background"
            padding="$4"
            borderRadius="$4">
            <XStack gap="$4">
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
            </XStack>
          </ScrollView>
          <Separator />

        </Sheet.Frame>
      </Sheet>
    </>
  )
}