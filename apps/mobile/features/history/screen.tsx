import { Paragraph, Spinner, YStack, useMedia } from '@/ui';
import { trpc } from '@/utils/trpc';
import { match } from 'ts-pattern';
import { empty, error, loading, success } from '@/utils/trpc/patterns'
import { EmptyResult } from '@/ui/components/EmptyResult';
import { NoteItem } from '@server/modules/note/note';
import { NoteList } from '@/ui/note/NoteList';

export function HistoryScreen() {
  const historyList = trpc.history.list.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
    }
  );

  const media = useMedia()

  const noteListLayout = match(historyList)
    .with(error, () => <EmptyResult message={historyList.failureReason?.message} />)
    .with(loading, () => (
      <YStack fullscreen flex={1} justifyContent='center' alignItems='center'>
        <Paragraph paddingBottom='$3'>Loading...</Paragraph>
        <Spinner />
      </YStack>
    ))
    .with(empty, () => <Paragraph>没有任何浏览记录</Paragraph>)
    .with(success, () => (
      <NoteList
        data={historyList.data?.pages.flatMap(page => page.items) as unknown as NoteItem[]}
        isRefetching={historyList.isRefetching}
        onRefresh={() => historyList.refetch()}
        onEndReached={() => historyList.fetchNextPage()}
      />
    ))
    .otherwise(() => <EmptyResult message={historyList.failureReason?.message} />)

  return (
    <YStack flex={1} backgroundColor={'$background'}>
      {noteListLayout}
    </YStack>
  )
}