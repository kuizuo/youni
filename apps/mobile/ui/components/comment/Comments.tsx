import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CommentItem } from '@server/modules/comment/comment'
import { CommentRefType } from '@server/modules/comment/comment.constant'
import { useAtom, useAtomValue } from 'jotai'
import type { ListRenderItem } from '@shopify/flash-list'
import { FlashList } from '@shopify/flash-list'
import { RefreshControl } from 'react-native-gesture-handler'
import {
  Avatar,
  AvatarImage,
  Badge,
  BadgeText,
  Button,
  ButtonGroup,
  ButtonText,
  Divider,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
  View,
} from '@gluestack-ui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import { EmptyResult } from '../EmptyResult'
import { CommentLikeButton } from './CommentLikeButton'
import { CommentButton } from './CommentButton'
import { trpc } from '@/utils/trpc'
import { formatTime } from '@/utils/date'
import { newCommentsAtom, useCurrentNote } from '@/atoms/comment'
import { useAuth } from '@/utils/auth'

export default function Comments() {
  const [note, _] = useCurrentNote()

  const ref = useRef<FlashList<CommentItem>>(null)

  const [data, { hasNextPage, fetchNextPage, isFetchingNextPage }] = trpc.comment.page.useSuspenseInfiniteQuery({
    itemId: note.id,
    itemType: 'Note' as CommentRefType.Note,
  }, { getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor })

  const [orderBy, setOrderBy] = useState<'asc' | 'desc'>('asc')

  const flatedData = useMemo(() => {
    const result = data?.pages.map(page => page.items).flat() || []
    if (orderBy === 'desc')
      result.reverse()
    return result as unknown as CommentItem[]
  }, [data?.pages, orderBy])

  const renderItem: ListRenderItem<CommentItem> = useCallback(
    ({ item }) => (
      <Comment key={item.id} comment={item} />
    ),
    [note.id],
  )

  // useEffect(() => {
  //   // 组件销毁自动清空新增评论
  //   return () => {
  //     setComments([])
  //   }
  // }, [])

  return (
    <>
      <FlashList
        ref={ref}
        data={flatedData}
        removeClippedSubviews={false}
        // refreshControl={
        //   <RefreshControl
        //     refreshing={isRefetchingByUser}
        //     onRefresh={refetchByUser}
        //     progressViewOffset={navbarHeight}
        //   />
        // }
        renderItem={renderItem}
        ItemSeparatorComponent={Divider}
        onEndReached={() => {
          if (hasNextPage)
            fetchNextPage()
        }}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={(
          <View className="flex-row justify-between items-center">
            <Text size="sm" color="gray">
              {`共 ${note.interact.commentCount} 条评论`}
            </Text>

            {/* <ButtonGroup isAttached>
              <Button variant="outline" size="xs" borderColor="$backgroundLight300" borderRightWidth="$0" $dark-borderColor="$backgroundDark700">
                <ButtonText color="$textLight800" $dark-color="$textDark300">
                  默认
                </ButtonText>
              </Button>
              <Button variant="outline" size="xs" borderColor="$backgroundLight300" $dark-borderColor="$backgroundDark70">
                <ButtonText color="$textLight800" $dark-color="$textDark300">
                  最新
                </ButtonText>
              </Button>
            </ButtonGroup> */}
          </View>
        )}
        ListFooterComponent={(
          <SafeAreaView edges={['bottom']}>
            {isFetchingNextPage
              ? <Spinner />
              : (
                <View my="$3" flex={1} justifyContent="center" alignItems="center">
                  <Text size="sm" color="$secondary500">没有更多了</Text>
                </View>
                )}
          </SafeAreaView>
        )}
        ListEmptyComponent={<EmptyResult title="目前还没有回复" />}
      />
    </>
  )
}

const Comment = memo(function Comment({ comment }: { comment: CommentItem }) {
  const [note, _] = useCurrentNote()

  const { currentUser } = useAuth()

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

  const MoreCommentButton = () => {
    if (isFetching)
      return <Spinner />

    if (comment.interact.commentCount > 1 && comment.children.length === 1) {
      return (
        <Text size="sm" color="#1e40af" onPress={loadMore}>
          {`展开 ${comment.interact.commentCount - 1} 条评论`}
        </Text>
      )
    }

    if (hasNextPage) {
      return (
        <Text size="sm" color="#1e40af" onPress={loadMore}>
          展开更多
        </Text>
      )
    }
  }

  return (
    <HStack gap="$2.5" alignItems="center" my="$2">
      <Avatar borderRadius="$full" size="sm" alignSelf="flex-start">
        <AvatarImage
          source={{
            uri: comment.user.avatar,
          }}
        />

      </Avatar>
      <VStack flex={1}>
        <HStack alignItems="center">
          <VStack gap="$1">
            <HStack gap="$2" mt="$1" alignItems="center">
              <Heading size="sm">
                {comment.user.nickname}
              </Heading>
              {
                comment.user.id === note.user.id && (
                  <Badge size="sm" action="error">
                    <BadgeText>作者</BadgeText>
                  </Badge>
                )
              }
              {
                comment.user.id === currentUser?.id && (
                  <Badge size="sm" action="info">
                    <BadgeText>你</BadgeText>
                  </Badge>
                )
              }
            </HStack>
            <Text size="sm">
              {comment.content}
            </Text>
          </VStack>
        </HStack>

        <HStack alignItems="center" marginTop="$1">
          <Text size="sm" color="$secondary500">
            {formatTime(comment.createdAt)}
          </Text>
          <HStack flex={1} gap="$2.5" justifyContent="flex-end" alignItems="center">
            <CommentButton item={comment} />
            <CommentLikeButton
              item={comment}
            />
          </HStack>
        </HStack>

        {
          comment?.children?.length > 0 && (
            <VStack mt="$2" gap="$2">
              {
                comment.children.map(child => (
                  <Comment key={child.id} comment={child as unknown as CommentItem} />
                ))
              }
              <MoreCommentButton />
            </VStack>
          )
        }
      </VStack>
    </HStack>
  )
})
