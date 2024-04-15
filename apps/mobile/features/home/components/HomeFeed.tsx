import { memo, useMemo } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { View } from '@gluestack-ui/themed'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { trpc } from '@/utils/trpc'
import { NoteList } from '@/ui/components/note/NoteList'
import { withQuerySuspense } from '@/ui/components/QuerySuspense'

function HomeFeed() {
  const [data, { isRefetching, refetch, hasNextPage, fetchNextPage }] = trpc.note.homeFeed.useSuspenseInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
      cacheTime: 1,
      useErrorBoundary: true,
    },
  )

  const flatedData = useMemo(
    () => data.pages.map(page => page.items).flat() as unknown as NoteItem[],
    [data.pages],
  )

  return (
    <View flex={1}>
      <NoteList
        data={flatedData}
        isRefreshing={isRefetching}
        onRefresh={() => refetch()}
        onEndReached={() => {
          if (hasNextPage)
            fetchNextPage()
        }}
        ListEmptyComponent={
          <EmptyResult title="没有更多了" />
        }
      />
    </View>
  )
}

export default withQuerySuspense(memo(HomeFeed))
