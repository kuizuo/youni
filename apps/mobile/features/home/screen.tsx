import { CarListError } from '@/ui/notes/NoteListError'
import { NoteListItem } from '@/ui/notes/NoteListItem'
import { Paragraph, Spinner, YStack, Text, useMedia } from '@/ui'
import { trpc } from '@/utils/trpc'
import { empty, error, loading, success } from '@/utils/trpc/patterns'
import { MasonryFlashList } from '@shopify/flash-list'
import React from 'react'
import { RefreshControl } from 'react-native-gesture-handler'
import { match } from 'ts-pattern'

export const HomeScreen = (): React.ReactNode => {
  const noteList = trpc.note.homeFeed.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.startCursor,
    }
  );

  const media = useMedia()

  const noteListLayout = match(noteList)
    .with(error, () => <CarListError message={noteList.failureReason?.message} />)
    .with(loading, () => (
      <YStack fullscreen flex={1} justifyContent='center' alignItems='center'>
        <Paragraph paddingBottom='$3'>Loading...</Paragraph>
        <Spinner />
      </YStack>
    ))
    .with(empty, () => <Paragraph>没有更多数据</Paragraph>)
    .with(success, () => (
      <MasonryFlashList
        data={noteList.data?.pages[0]?.items as any[]}
        refreshControl={
          <RefreshControl refreshing={noteList.isRefetching} />
        }
        refreshing={noteList.isRefetching}
        renderItem={({ item }) => <NoteListItem {...item}></NoteListItem>}
        numColumns={media.gtLg ? 4 : media.gtMd ? 3 : 2}
        estimatedItemSize={200}
      />
    ))
    .otherwise(() => <CarListError message={noteList.failureReason?.message} />)

  return (
    <YStack flex={1} backgroundColor={'$background'}>
      {noteListLayout}
    </YStack>
  )
}
