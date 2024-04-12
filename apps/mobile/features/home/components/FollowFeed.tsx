import React, { memo, useMemo } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { RefreshControl } from 'react-native-gesture-handler'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { ScrollView, Text, View } from '@/ui'
import { trpc } from '@/utils/trpc'
import { UserNoteList } from '@/ui/components/user/UserNoteList'
import { useUser } from '@/utils/auth/hooks/useUser'
import { withQuerySuspense } from '@/ui/components/QuerySuspense'
import tw from '@/utils/tw'

const FollowFeed = memo(() => {
  const { currentUser } = useUser()

  const [data] = trpc.interact.state.useSuspenseQuery({ id: currentUser?.id }, {
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

  const handleRefresh = () => {
    refetch()
  }

  const EmptyUserFollowing = () => {
    return (
      <ScrollView
        marginTop="$4"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
      >
        <View style={tw`items-center`}>
          <Text style={tw`text-base`}>还没有关注的用户</Text>
          <Text style={tw`text-xs`}>关注后，可在这里查看对方的最新动态</Text>
        </View>
        {/* 你可能认识的人 */}
      </ScrollView>
    )
  }

  return (
    <View style={tw`flex-1 bg-background`}>
      {!hasFollowedUsers
        ? <EmptyUserFollowing />
        : (
          <>
            <UserNoteList
              data={flatedData}
              isRefreshing={isRefetching}
              onRefresh={handleRefresh}
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
