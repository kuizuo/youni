import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CommentItem } from '@server/modules/comment/comment'
import { CommentRefType } from '@server/modules/comment/comment.constant'
import { useAtom, useAtomValue } from 'jotai'
import type { ListRenderItem } from '@shopify/flash-list'
import { FlashList } from '@shopify/flash-list'
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
  Icon,
  Pressable,
  Spinner,
  Text,
  VStack,
  View,
} from '@gluestack-ui/themed'
import { Ellipsis } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { EmptyResult } from '../EmptyResult'
import type { NoteItem } from '../../../../server/src/modules/note/note'
import { CommentLikeButton } from './CommentLikeButton'
import { CommentButton } from './CommentButton'
import { trpc } from '@/utils/trpc'
import { formatTime } from '@/utils/date'
import { useCurrentNote } from '@/atoms/comment'
import { useAuth } from '@/utils/auth'

export default function Comments({
  note,
}: {
  note: NoteItem
}) {
  // const [note, _] = useCurrentNote()

  const ref = useRef<FlashList<CommentItem>>(null)

  const [data, { isRefetching, refetch, hasNextPage, fetchNextPage, isFetchingNextPage }] = trpc.comment.page.useSuspenseInfiniteQuery({
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

  return (
    <>
      <FlashList
        ref={ref}
        data={flatedData}
        removeClippedSubviews={false}
        renderItem={renderItem}
        ItemSeparatorComponent={Divider}
        onEndReached={() => {
          if (hasNextPage)
            fetchNextPage()
        }}
        onEndReachedThreshold={0.3}
        estimatedItemSize={500}
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
      />
    </>
  )
}

const Comment = memo(function Comment({ comment }: { comment: CommentItem }) {
  const [note, _] = useCurrentNote()

  const { showActionSheetWithOptions } = useActionSheet()

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

  const handleLongPress = () => {
    if (currentUser?.id === comment.user.id) {
      return showActionSheetWithOptions({
        options: ['删除', '取消'],
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0,
      }, async (selectedIndex) => {
        if (selectedIndex === 0) {
          await trpc.comment.delete.mutate({
            commentId: comment.id,
          })
        }
      })
    }

    // TODO:
    const options = ['举报', '屏蔽', '分享', '复制', '取消']

    const destructiveButtonIndex = options.indexOf('举报')
    const cancelButtonIndex = options.indexOf('取消')

    showActionSheetWithOptions({
      options,
      destructiveButtonIndex,
      cancelButtonIndex,
    }, async (selectedIndex) => {
      switch (selectedIndex) {
        case destructiveButtonIndex:
          //

          break
        case cancelButtonIndex:
        // Canceled
      }
    })
  }

  return (
    <Pressable
      delayLongPress={300}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        { flex: 1, backgroundColor: pressed ? 'red' : 'transport' },
      ]}
    >
      <HStack gap="$2.5" my="$2" alignItems="center">
        <Avatar borderRadius="$full" size="sm" alignSelf="flex-start" overflow="hidden">
          <AvatarImage
            source={{
              uri: comment.user.avatar,
            }}
          />
        </Avatar>
        <VStack flex={1}>
          <HStack flex={1} mt="$1" justifyContent="space-between" alignItems="center">
            <HStack flex={1} gap="$2">
              <Heading size="xs">
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
            <Pressable className="flex-1 absolute right-2" onPress={handleLongPress}>
              <Icon as={Ellipsis} size="sm" color="gray" />
            </Pressable>
          </HStack>

          <Text size="sm">
            {comment.content}
          </Text>

          <View className="flex-row mt-1 items-center">
            <Text size="xs" color="$secondary500">
              {formatTime(comment.createdAt)}
            </Text>
            <HStack flex={1} gap="$2.5" justifyContent="flex-end" alignItems="center">
              <CommentButton item={comment} />
              <CommentLikeButton
                item={comment}
              />
            </HStack>
          </View>

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
    </Pressable>
  )
})
