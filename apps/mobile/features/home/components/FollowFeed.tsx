import React, { useMemo } from 'react'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { ScrollView, SizableText, Spinner, View, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { error, infiniteEmpty, loading, success } from '@/utils/trpc/patterns'
import { P, match } from 'ts-pattern'
import { NoteItem } from '@server/modules/note/note'
import { UserNoteList } from '@/ui/components/user/UserNoteList'
import { useUser } from '@/utils/auth/hooks/useUser'
import { RefreshControl } from 'react-native-gesture-handler'

export const FollowFeed = (): React.ReactNode => {
  const { currentUser } = useUser()
  const { data } = trpc.interact.state.useQuery({ id: currentUser!.id })

  const hasFollowedUsers = useMemo(() => data?.followingCount !== 0, [data?.followingCount])

  const followFeed = trpc.note.followFeed.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
      enabled: hasFollowedUsers,
    }
  )

  const isRefetching = useMemo(() => followFeed.isRefetching, [followFeed.isRefetching])

  const handleRefresh = () => {
    followFeed.refetch()
  }

  const EmptyUserFollowing = () => {
    return <ScrollView
      marginTop="$4"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
    >
      <YStack alignItems='center'>
        <SizableText fontSize={16}>还没有关注的用户</SizableText>
        <SizableText fontSize={10} >关注后，可在这里查看对方的最新动态</SizableText>
      </YStack>
      {/* 你可能认识的人 */}
    </ScrollView>
  }

  const followFeedLayout = match(followFeed)
    .with(error, () => <EmptyResult title={followFeed.failureReason?.message} />)
    .with(loading, () => <Spinner />)
    .with(infiniteEmpty, () =>
      <EmptyResult
        title={'关注的人近期未发布笔记'}
        subTitle={'去发现更多有趣的人吧'}
        isRefreshing={isRefetching}
        onRefresh={handleRefresh}
      />
    )
    .with(success, () => (
      <UserNoteList
        data={followFeed.data?.pages.flatMap(page => page.items) as unknown as NoteItem[]}
        isRefreshing={isRefetching}
        onRefresh={handleRefresh}
        onEndReached={() => followFeed.fetchNextPage()}
      />
    ))
    .otherwise(() => <EmptyResult title={followFeed.failureReason?.message} />)

  return (
    <YStack flex={1} backgroundColor={'$background'}>
      {!hasFollowedUsers ? <EmptyUserFollowing /> : followFeedLayout}
    </YStack>
  )
}
