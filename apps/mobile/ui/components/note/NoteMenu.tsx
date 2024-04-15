import { ChevronDown, Menu } from 'lucide-react-native'
import type { NoteItem } from '../../../../server/src/modules/note/note'
import { Button, Divider, HStack, ScrollView, Sheet, Text } from '@/ui'
import { useSheetOpen } from '@/atoms/sheet'

interface Props {
  item: NoteItem
}

export function NoteMenu({ item }: Props) {
  const [open, setOpen] = useSheetOpen()

  return (
    <>
      <Button size="sm" icon={<Menu size="sm" />} unstyled onPress={() => setOpen(true)} />
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
          <Text>分享至</Text>
          <ScrollView
            maxHeight={250}
            bg="$background"
            p="$4"
            br="$4"
          >
            <HStack gap="$4">
              <Button size="sm" icon={<ChevronDown size="sm" />} />
              <Button size="sm" icon={<ChevronDown size="sm" />} />
            </HStack>
          </ScrollView>
          <Divider />
          <ScrollView
            maxHeight={250}
            bg="$background"
            p="$4"
            br="$4"
          >
            <HStack gap="$4">
              <Button size="sm" icon={<ChevronDown size="sm" />} />
              <Button size="sm" icon={<ChevronDown size="sm" />} />
              <Button size="sm" icon={<ChevronDown size="sm" />} />
              <Button size="sm" icon={<ChevronDown size="sm" />} />
              <Button size="sm" icon={<ChevronDown size="sm" />} />
              <Button size="sm" icon={<ChevronDown size="sm" />} />
              <Button size="sm" icon={<ChevronDown size="sm" />} />
              <Button size="sm" icon={<ChevronDown size="sm" />} />
              <Button size="sm" icon={<ChevronDown size="sm" />} />
              <Button size="sm" icon={<ChevronDown size="sm" />} />
            </HStack>
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
