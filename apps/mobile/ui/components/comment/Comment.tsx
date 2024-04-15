import React, { memo, useEffect } from 'react'
import type { CommentItem } from '@server/modules/comment/comment'
import { CommentRefType } from '@server/modules/comment/comment.constant'
import { useAtom, useAtomValue } from 'jotai'
import { CommentLikeButton } from './CommentLikeButton'
import { CommentButton } from './CommentButton'
import { trpc } from '@/utils/trpc'
import { Avatar, Separator, SizableText, Spinner, Text, View, XStack, YStack, useTheme } from '@/ui'
import { formatTime } from '@/utils/date'
import { newCommentsAtom, useCurrentNote } from '@/atoms/comment'
import { useAuth } from '@/utils/auth'

export function CommentList() {
  const [note, _] = useCurrentNote()

  const [newComments, setComments] = useAtom(newCommentsAtom)

  const { data, isLoading } = trpc.comment.page.useInfiniteQuery({
    itemId: note.id,
    itemType: CommentRefType.Note,
  }, { getNextPageParam: lastPage => lastPage.meta.endCursor })

  useEffect(() => {
    // 组件销毁自动清空新增评论
    return () => {
      setComments([])
    }
  }, [])

  if (isLoading)
    return <Spinner size="large" />

  if (!data || !data.pages.length || !data.pages[0]?.items.length) {
    return (
      <>
        <Text textAlign="center" color="gray" marginTop="$2"> 这里空空如也~~ </Text>
      </>
    )
  }

  return (
    <>
      {/* 新增评论 */}
      {
        newComments.filter(c => !c.parentId).map(comment => (
          <CommentListItem
            comment={comment as unknown as CommentItem}
            key={comment.id}
          />
        ),
        )
      }
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
      <View my="$2" flex={1} jc="center" ai="center">
        <SizableText color="gray" size="$1">没有更多了</SizableText>
      </View>
    </>
  )
}

const CommentListItem = memo(({ comment }: { comment: CommentItem }) => {
  return (
    <YStack>
      <Comment comment={comment} />
    </YStack>
  )
})

const Comment = memo(function Comment({ comment }: { comment: CommentItem }) {
  const [note, _] = useCurrentNote()

  const newComments = useAtomValue(newCommentsAtom)
  const { currentUser } = useAuth()
  const theme = useTheme()

  const { isFetching, hasNextPage, fetchNextPage } = trpc.comment.subPage.useInfiniteQuery({
    itemId: note.id,
    itemType: CommentRefType.Note,
    rootId: comment.id,
    limit: 5,
  }, {
    enabled: false,
    initialCursor: comment?.children?.[0]?.id,
    getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
  })

  async function loadMore() {
    const { data } = await fetchNextPage()
    // 添加最后一个 pages 数据
    const lastPage = data?.pages[data.pages.length - 1]
    if (lastPage)
      comment.children.push(...(lastPage.items as unknown as CommentItem[]))
  }

  const MoreButton = () => {
    if (isFetching)
      return <Spinner />

    if (comment.interact.commentCount > 1 && comment.children.length === 1) {
      return (
        <SizableText size="$2" color="#1e40af" onPress={loadMore}>
          {`展开 ${comment.interact.commentCount - 1} 条评论`}
        </SizableText>
      )
    }

    if (hasNextPage) {
      return (
        <SizableText size="$2" color="#1e40af" onPress={loadMore}>
          展开更多
        </SizableText>
      )
    }
  }

  return (
    <XStack gap="$2.5" ai="center" my="$2">
      <Avatar circular size="$2.5" alignSelf="flex-start">
        <Avatar.Image
          // @ts-expect-error
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
        <XStack ai="center">
          <YStack gap="$1">
            <XStack gap="$2">
              <Text fontSize={15} color="gray" marginTop="$-1">
                {comment.user.nickname}
              </Text>
              {
                comment.user.id === note.user.id && (
                  <View px="$1.5" br="$2" bg={theme.$accent10?.get()}>
                    <Text fontSize={12} themeInverse>作者</Text>
                  </View>
                )
              }
              {
                comment.user.id === currentUser?.id && (
                  <View px="$1.5" br="$2" bg={theme.$blue10?.get()}>
                    <Text fontSize={12} themeInverse>你</Text>
                  </View>
                )
              }
            </XStack>
            <Text>
              {comment.content}
            </Text>
          </YStack>
        </XStack>

        <XStack ai="center" marginTop="$2">
          <Text color="gray" fontSize={12}>
            {formatTime(comment.createdAt)}
          </Text>
          <XStack flex={1} gap="$2.5" jc="flex-end" ai="center">
            <CommentButton item={comment} />
            <CommentLikeButton
              item={comment}
            />
          </XStack>
        </XStack>

        {
          comment?.children?.length > 0 && (
            <YStack marginTop="$2" gap="$2">
              {/* 新增评论 */}
              {
                newComments.filter(c => c.parentId).map(comment =>
                  <Comment key={comment.id} comment={comment as unknown as CommentItem} />,
                )
              }
              {
                comment.children.map(child => (
                  <Comment key={child.id} comment={child as unknown as CommentItem} />
                ))
              }
              {/* 更多评论 */}
              <XStack>
                <MoreButton />
              </XStack>
            </YStack>
          )
        }
      </YStack>
    </XStack>
  )
})

export default CommentList
