import { trpc } from "@/utils/trpc"
import React, { memo } from "react"
import { YStack, XStack, Avatar, Text } from "../.."
import { CommentItem } from '@server/modules/comment/comment'
import { formatTime } from "@/utils/date"
import { CommentLikeButton } from "./CommentLikeButton"
import { CommentButton } from "./CommentButton"

export const CommentList = ({ itemId, itemType, authorId }) => {
  const { data, isLoading } = trpc.comment.page.useInfiniteQuery({
    itemId: itemId,
    itemType: itemType,
  }, { getNextPageParam: (lastPage) => lastPage.meta.endCursor })


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
                authorId={authorId}
                key={comment.id}
              />
            )
          })
        )
      })
    }
  </>
}

const CommentListItem = memo(({ comment, authorId }: { comment: CommentItem, authorId: string }) => {
  return <YStack>
    <Comment comment={comment} authorId={authorId} />
  </YStack>
})

const Comment = memo(({ comment, authorId }: { comment: CommentItem, authorId: string }) => {
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
          <XStack gap="$2">
            <Text fontSize={15} color={'gray'} marginTop='$-1' >
              {comment.user.nickname}
            </Text>
            {
              comment.user.id === authorId && <Text fontSize={12} backgroundColor={'red'} borderRadius={'$2'}> 作者 </Text>
            }
            {
              // comment.user.id === currentId && <Text fontSize={12} backgroundColor={'red'} borderRadius={'$2'}> You </Text>
            }
          </XStack>
          <Text>
            {comment.content}
          </Text>
        </YStack>
      </XStack>

      <XStack alignItems="center" marginTop='$2'>
        <Text color={'gray'} fontSize={12} >
          {formatTime(comment.createdAt)}
        </Text>
        <XStack flex={1} gap="$2.5" justifyContent="flex-end" alignItems="center" >
          <CommentButton item={comment} />
          <CommentLikeButton
            item={comment}
          />
        </XStack>
      </XStack>

      {
        comment?.children?.length > 0 && (
          <YStack marginTop='$2' gap='$2'>
            {
              comment.children.map((child) => (
                <Comment comment={child as unknown as CommentItem} key={child.id} authorId={authorId} />
              ))
            }
          </YStack>
        )
      }
    </YStack>
  </XStack >
})

export default CommentList;