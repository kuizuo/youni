
import { MessageCircle } from "@tamagui/lucide-icons"
import { Button, Input, Sheet, SizeTokens, XStack } from ".."
import { CommentItem } from "@server/modules/comment/comment"
import { useSheetOpen } from "@/atoms/sheet";
import { NoteItem } from "@server/modules/note/note";
import { CommentSheet } from "./CommentSheet";

export interface Props {
  item: CommentItem
  size?: SizeTokens
}

export const CommentButton = ({
  item,
  size = 16
}: Props) => {
  // const [commentCount, setCommentCount] = useState(item.interact.commentCount)
  const [open, setOpen] = useSheetOpen()

  return <>
    <XStack alignItems="center" gap='$1.5'>
      <Button
        icon={<MessageCircle
          color='gray'
          size={size} />}
        onPress={() => setOpen(true)}
        unstyled>
      </Button>
      <CommentSheet item={{ id: item.refId } as NoteItem} parentId={item.id}></CommentSheet>
      {/* <Text fontSize={size} color={'gray'}>
      {commentCount || ''}
    </Text> */}
    </XStack>

  </>
}

