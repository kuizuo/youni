import { ArrowUpRightFromSquare, ChevronDown } from '@tamagui/lucide-icons'
import type { NoteItem } from '@server/modules/note/note'
import React, { useState } from 'react'
import { Button, ScrollView, Separator, Sheet, SizableText, XStack } from '@/ui'

interface Props {
  item: NoteItem
}

export function NoteShareButton({ item }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="$1" icon={<ArrowUpRightFromSquare size="$1" />} unstyled onPress={() => setOpen(true)}></Button>
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
        <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" gap="$5">
          <SizableText>分享至</SizableText>
          <ScrollView
            maxHeight={250}
            backgroundColor="$background"
            padding="$4"
            borderRadius="$4"
          >
            <XStack gap="$4">
              <Button size="$1" icon={<ChevronDown size="$1" />} />
              <Button size="$1" icon={<ChevronDown size="$1" />} />
              <Button size="$1" icon={<ChevronDown size="$1" />} />
              <Button size="$1" icon={<ChevronDown size="$1" />} />

              <Button size="$1" icon={<ChevronDown size="$1" />} />
            </XStack>
          </ScrollView>
          <Separator />
          <ScrollView
            maxHeight={250}
            backgroundColor="$background"
            padding="$4"
            borderRadius="$4"
          >
            <XStack gap="$4">
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
