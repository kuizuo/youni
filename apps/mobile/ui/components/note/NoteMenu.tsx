import { ChevronDown, Menu } from '@tamagui/lucide-icons'
import type { NoteItem } from '../../../../server/src/modules/note/note'
import { Button, ScrollView, Separator, Sheet, SizableText, XStack } from '@/ui'
import { useSheetOpen } from '@/atoms/sheet'

interface Props {
  item: NoteItem
}

export function NoteMenu({ item }: Props) {
  const [open, setOpen] = useSheetOpen()

  return (
    <>
      <Button size="$1" icon={<Menu size="$1" />} unstyled onPress={() => setOpen(true)} />
      <Sheet
        forceRemoveScrollEnabled={open}
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
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle />
        <Sheet.Frame p="$4" jc="center" ai="center" gap="$5">
          <SizableText>分享至</SizableText>
          <ScrollView
            maxHeight={250}
            bg="$background"
            p="$4"
            br="$4"
          >
            <XStack gap="$4">
              <Button size="$1" icon={<ChevronDown size="$1" />} />
              <Button size="$1" icon={<ChevronDown size="$1" />} />
            </XStack>
          </ScrollView>
          <Separator />
          <ScrollView
            maxHeight={250}
            bg="$background"
            p="$4"
            br="$4"
          >
            <XStack gap="$4">
              <Button size="$1" icon={<ChevronDown size="$1" />} />
              <Button size="$1" icon={<ChevronDown size="$1" />} />
              <Button size="$1" icon={<ChevronDown size="$1" />} />
              <Button size="$1" icon={<ChevronDown size="$1" />} />
              <Button size="$1" icon={<ChevronDown size="$1" />} />
              <Button size="$1" icon={<ChevronDown size="$1" />} />
              <Button size="$1" icon={<ChevronDown size="$1" />} />
              <Button size="$1" icon={<ChevronDown size="$1" />} />
              <Button size="$1" icon={<ChevronDown size="$1" />} />
              <Button size="$1" icon={<ChevronDown size="$1" />} />
            </XStack>
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
