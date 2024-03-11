import { Paragraph, Spinner, YStack, useMedia } from '@/ui';
import { trpc } from '@/utils/trpc';
import { match } from 'ts-pattern';
import { empty, error, loading, success } from '@/utils/trpc/patterns'
import { EmptyResult } from '@/ui/components/EmptyResult';
import { NoteListItem } from '@/ui/note/NoteListItem';
import { MasonryFlashList } from '@shopify/flash-list';
import { RefreshControl } from 'react-native';
import { NoteItem } from '@server/modules/note/note';

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
      <MasonryFlashList
        data={historyList.data?.pages[0]?.items as unknown as NoteItem[]}
        refreshControl={
          <RefreshControl refreshing={historyList.isRefetching} />
        }
        refreshing={historyList.isRefetching}
        renderItem={({ item }) => <NoteListItem {...item}></NoteListItem>}
        numColumns={media.gtLg ? 4 : media.gtMd ? 3 : 2}
        estimatedItemSize={200}
      />
    ))
    .otherwise(() => <EmptyResult message={historyList.failureReason?.message} />)

  return (
    <YStack flex={1} backgroundColor={'$background'}>
      {noteListLayout}
    </YStack>
  )
}