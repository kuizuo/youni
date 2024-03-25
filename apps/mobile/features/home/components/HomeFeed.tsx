import { match } from 'ts-pattern'
import type { NoteItem } from '@server/modules/note/note'
import { memo } from 'react'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { Paragraph, Spinner, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { empty, error, loading, success } from '@/utils/trpc/patterns'
import { NoteList } from '@/ui/components/note/NoteList'

function HomeFeed(): React.ReactNode {
  const homeFeed = trpc.note.homeFeed.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
      cacheTime: 1,
    },
  )

  const homeFeedLayout = match(homeFeed)
    .with(error, () => <EmptyResult title={homeFeed.failureReason?.message} />)
    .with(loading, () => (
      <YStack fullscreen flex={1} jc="center" ai="center">
        <Paragraph pb="$3">Loading...</Paragraph>
        <Spinner />
      </YStack>
    ))
    .with(empty, () => <EmptyResult title="没有更多数据" />)
    .with(success, () => (
      <NoteList
        data={homeFeed.data?.pages.flatMap(page => page.items) as unknown as NoteItem[]}
        isRefreshing={homeFeed.isRefetching}
        onRefresh={() => homeFeed.refetch()}
        onEndReached={() => homeFeed.fetchNextPage()}
      />
    ))
    .otherwise(() => <EmptyResult title={homeFeed.failureReason?.message} />)

  return (
    <YStack flex={1} bg="$background">
      {homeFeedLayout}
    </YStack>
  )
}

export default memo(HomeFeed)
