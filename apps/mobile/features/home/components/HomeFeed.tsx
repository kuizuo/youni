import { EmptyResult } from '@/ui/components/EmptyResult'
import { Paragraph, Spinner, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { empty, error, loading, success } from '@/utils/trpc/patterns'
import { match } from 'ts-pattern'
import { NoteList } from '@/ui/note/NoteList'
import { NoteItem } from '@server/modules/note/note'

export const HomeFeed = (): React.ReactNode => {
  const homeFeed = trpc.note.homeFeed.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
    }
  )

  const homeFeedLayout = match(homeFeed)
    .with(error, () => <EmptyResult message={homeFeed.failureReason?.message} />)
    .with(loading, () => (
      <YStack fullscreen flex={1} justifyContent='center' alignItems='center'>
        <Paragraph paddingBottom='$3'>Loading...</Paragraph>
        <Spinner />
      </YStack>
    ))
    .with(empty, () => <Paragraph>没有更多数据</Paragraph>)
    .with(success, () => (
      <NoteList
        data={homeFeed.data?.pages.flatMap(page => page.items) as unknown as NoteItem[]}
        isRefetching={homeFeed.isRefetching}
        onRefresh={() => homeFeed.refetch()}
        onEndReached={() => homeFeed.fetchNextPage()}
      />
    ))
    .otherwise(() => <EmptyResult message={homeFeed.failureReason?.message} />)

  return (
    <YStack flex={1} backgroundColor={'$background'}>
      {homeFeedLayout}
    </YStack>
  )
}
