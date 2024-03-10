import { trpc } from "@/utils/trpc"
import React, { memo } from "react"
import { YStack, XStack, Avatar, Text, Button } from ".."
import { CommentItem } from '@server/modules/comment/comment'
import { formatTime } from "@/utils/date"
import { MessageCircle } from "@tamagui/lucide-icons"
import { CommentLikeButton } from "./CommentLikeButton"

export const CommentList = ({ itemId, itemType }) => {
  const { data, isLoading } = trpc.comment.page.useInfiniteQuery({
    itemId: itemId,
    itemType: itemType,
  }, { getNextPageParam: (lastPage) => lastPage.meta.startCursor })


  if (isLoading) {
    return <Text> 加载中...</Text>
  }

  if (!data || !data.pages.length || !data.pages[0]?.items.length) {
    return <>
      <Text textAlign="center" color="gray" marginTop="$2"> 这里空空如也~~ </Text>
    </>
  }

  return <>
    {
      data?.pages.map((data, index) => {
        return (
          data.items.map((comment) => {
            return (
              <CommentListItem
                comment={comment as unknown as CommentItem}
                key={comment.id}
              />
            )
          })
        )
      })
    }
  </>
}

const CommentListItem = memo(({ comment }: { comment: CommentItem }) => {
  return <YStack>
    <Comment comment={comment} />
  </YStack>
})

const Comment = memo(({ comment }: { comment: CommentItem }) => {
  return <XStack gap='$2.5' alignItems='center' marginVertical="$2">
    <Avatar circular size="$2.5" alignSelf='flex-start' >
      <Avatar.Image
        // @ts-ignore
        source={
          {
            uri: comment.user.avatar,
            width: '100%',
            height: '100%',
          }
        }
      />
      <Avatar.Fallback />
    </Avatar>
    <YStack flex={1}>
      <XStack alignItems="center">
        <YStack gap='$1'>
          <Text fontSize={15} color={'gray'} marginTop='$-1' >
            {comment.user.nickname}
          </Text>
          <Text>
            {comment.content}
          </Text>
        </YStack>

        <XStack flex={1} justifyContent="flex-end">
          <CommentLikeButton
            item={comment}
            size={14}
          />
        </XStack>
      </XStack>

      <XStack alignItems="center" gap='$2.5' marginTop='$2'>
        <Text color={'gray'} fontSize={12} >
          {formatTime(comment.createdAt)}
        </Text>
        <Button
          icon={<MessageCircle
            color='gray'
            size={14} />}
          unstyled>
        </Button>
      </XStack>

      {
        comment?.children?.length > 0 && (
          <YStack marginTop='$2' gap='$2' >
            {
              comment.children.map((child) => (
                <Comment comment={child as unknown as CommentItem} />
              ))
            }
          </YStack>
        )
      }
    </YStack>
  </XStack >
})

export default CommentList;