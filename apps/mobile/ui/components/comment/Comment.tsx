import { trpc } from "@/utils/trpc"
import React, { memo } from "react"
import { YStack, XStack, Avatar, Text, useTheme, View, Separator, Spinner, SizableText } from "@/ui"
import { CommentItem } from '@server/modules/comment/comment'
import { formatTime } from "@/utils/date"
import { CommentLikeButton } from "./CommentLikeButton"
import { CommentButton } from "./CommentButton"
import { useCurrentNote } from "@/atoms/comment"
import { CommentRefType } from "@server/modules/comment/comment.constant"
import { useUser } from "@/utils/auth/hooks/useUser"

export const CommentList = () => {
  const [note, _] = useCurrentNote()

  const { data, isLoading } = trpc.comment.page.useInfiniteQuery({
    itemId: note.id,
    itemType: CommentRefType.Note,
  }, { getNextPageParam: (lastPage) => lastPage.meta.endCursor })


  if (isLoading) {
    return <Spinner size="large" />
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
    <Separator />
    <View marginVertical={'$2'} flex={1} justifyContent="center" alignItems="center">
      <SizableText color={'gray'} size={'$1'}>没有更多了</SizableText>
    </View>
  </>
}

const CommentListItem = memo(({ comment }: { comment: CommentItem }) => {
  return <YStack>
    <Comment comment={comment} />
  </YStack>
})

const Comment = memo(({ comment }: { comment: CommentItem }) => {
  const [note, _] = useCurrentNote()
  const { currentUser } = useUser()
  const theme = useTheme()

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
              comment.user.id === note.user.id && <View paddingHorizontal='$1.5' borderRadius={'$2'} backgroundColor={theme.$accent10?.get()}>
                <Text fontSize={12} themeInverse>作者</Text>
              </View>
            }
            {
              comment.user.id === currentUser?.id && <View paddingHorizontal='$1.5' borderRadius={'$2'} backgroundColor={theme.$blue10?.get()}>
                <Text fontSize={12} themeInverse>你</Text>
              </View>
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
        <XStack flex={1} gap="$2.5" justifyContent="flex-end" alignItems="center">
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
                <Comment comment={child as unknown as CommentItem} key={child.id} />
              ))
            }
          </YStack>
        )
      }
    </YStack>
  </XStack >
})

export default CommentList;