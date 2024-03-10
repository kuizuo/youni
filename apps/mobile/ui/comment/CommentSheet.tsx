
import { trpc } from "@/utils/trpc"
import { Keyboard } from 'react-native';
import { Button, Input, Sheet, XStack } from ".."
import React, { ElementRef, useEffect, useRef, useState } from "react"
import { useSheetOpen } from "@/atoms/sheet";
import { CommentRefType } from "@server/modules/comment/comment.constant";
import { NoteItem } from "@server/modules/note/note";

export const CommentSheet = ({ item, parentId }: { item: NoteItem, parentId?: string }) => {
  const [open, setOpen] = useSheetOpen()
  const [position, setPosition] = useState(0)

  const { mutateAsync: comment } = trpc.comment.create.useMutation()

  const inputRef = useRef<ElementRef<typeof Input>>(null)
  const [content, setContent] = useState('')

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setOpen(true)
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setOpen(false)
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }

  }, [open])


  const handleComment = async () => {
    if (!content) {
      return
    }

    await comment({ content, itemId: item.id, itemType: CommentRefType.Note, parentId })
    setOpen(false)
    inputRef.current?.clear()
    setContent('')
    Keyboard.dismiss()
  }

  const handleSheetChange = (open) => {
    setOpen(open)
    if (!open) {
      setContent('')
      inputRef.current?.clear()
      Keyboard.dismiss()

    }
  }

  return <Sheet
    modal
    open={open}
    onOpenChange={handleSheetChange}
    snapPoints={[10]}
    position={position}
    onPositionChange={setPosition}
    dismissOnSnapToBottom
    dismissOnOverlayPress
  >
    <Sheet.Frame paddingHorizontal="$4" alignItems='center'>
      <Sheet.Overlay
        backgroundColor={'transparent'}
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <XStack flex={1} gap='$2'>
        <Input ref={inputRef}
          flex={1}
          size="$2"
          placeholder={``}
          defaultValue={content}
          onChangeText={newText => setContent(newText)}
          onSubmitEditing={handleComment}
        />
        <Button size="$2" onPress={handleComment} >发送</Button>
      </XStack>
    </Sheet.Frame>
  </Sheet>
}