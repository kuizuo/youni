import type { NoteItem } from '@server/modules/note/note'
import { memo, useMemo } from 'react'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { NoteList } from '@/ui/components/note/NoteList'

function HomeFeed(): React.ReactNode {
  const [data, { isRefetching, refetch, hasNextPage, fetchNextPage }] = trpc.note.homeFeed.useSuspenseInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
      cacheTime: 1,
    },
  )

  const flatedData = useMemo(
    () => data.pages.map(page => page.items).flat() as unknown as NoteItem[],
    [data.pages],
  )

  return (
    <YStack flex={1} bg="$background">
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
    </YStack>
  )
}

export default memo(HomeFeed)
