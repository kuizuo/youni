import React, { memo, useMemo } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { RefreshControl } from 'react-native-gesture-handler'
import { Heading, ScrollView, Text, View } from '@gluestack-ui/themed'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { trpc } from '@/utils/trpc'
import { UserNoteList } from '@/ui/components/user/UserNoteList'
import { withQuerySuspense } from '@/ui/components/QuerySuspense'
import { useAuth } from '@/utils/auth'

const FollowFeed = memo(() => {
  const { currentUser } = useAuth()

  const [data] = trpc.interact.state.useSuspenseQuery({ id: currentUser.id }, {
    useErrorBoundary: true,
  })

  const hasFollowedUsers = useMemo(() => data?.followingCount !== 0, [data?.followingCount])

  const [followFeedData, { refetch, isRefetching, hasNextPage, fetchNextPage }] = trpc.note.followFeed.useSuspenseInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
      useErrorBoundary: true,
    },
  )

  const flatedData = useMemo(
    () => followFeedData.pages.map(page => page.items).flat() as unknown as NoteItem[],
    [followFeedData.pages],
  )

  const EmptyUserFollowing = () => {
    return (
      <ScrollView
        marginTop="$4"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View className="items-center">
          <Heading size="md" mb="$2">还没有关注的用户</Heading>
          <Text size="sm">关注后，可在这里查看对方的最新动态</Text>
        </View>
        {/* 你可能认识的人 */}
      </ScrollView>
    )
  }

  return (
    <View flex={1}>
      {!hasFollowedUsers
        ? <EmptyUserFollowing />
        : (
          <>
            <UserNoteList
              data={flatedData}
              isRefreshing={isRefetching}
              onRefresh={refetch}
              onEndReached={() => {
                if (hasNextPage)
                  fetchNextPage()
              }}
              ListEmptyComponent={(
                <EmptyResult
                  title="关注的人近期未发布笔记"
                  subTitle="去发现更多有趣的人吧"
                />
              )}
            />
          </>
          )}
    </View>
  )
})

export default withQuerySuspense(memo(FollowFeed))
