import { ChevronDown, Menu } from '@tamagui/lucide-icons'
import { Button, SizableText, Sheet, Separator, XStack, ScrollView } from '@/ui'
import { useSheetOpen } from '@/atoms/sheet'

export const NoteMenu = () => {
  const [open, setOpen] = useSheetOpen()

  return (
    <>
      <Button size={'$1'} icon={<Menu size={'$1'} />} unstyled onPress={() => setOpen(true)} />
      <Sheet
        forceRemoveScrollEnabled={open}
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
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" gap="$5">
          <SizableText>分享至</SizableText>
          <ScrollView
            maxHeight={250}
            backgroundColor="$background"
            padding="$4"
            borderRadius="$4">
            <XStack gap="$4">
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
            </XStack>
          </ScrollView>
          <Separator />
          <ScrollView
            maxHeight={250}
            backgroundColor="$background"
            padding="$4"
            borderRadius="$4">
            <XStack gap="$4">
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
              <Button size={'$1'} icon={<ChevronDown size={'$1'} />} />
            </XStack>
          </ScrollView>
        </Sheet.Frame>

      </Sheet>

    </>

  )

}