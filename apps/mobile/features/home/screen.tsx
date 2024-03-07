import { EmptyResult } from '@/ui/components/EmptyResult'
import { Paragraph, Spinner, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { empty, error, loading, success } from '@/utils/trpc/patterns'
import React from 'react'
import { match } from 'ts-pattern'
import { NoteList } from '@/ui/note/NoteList'

export const HomeScreen = (): React.ReactNode => {
  const homeFeed = trpc.note.homeFeed.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.startCursor,
    }
  );

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
      <NoteList data={homeFeed.data?.pages[0]?.items as any[]} isLoading={homeFeed.isFetching} />
    ))
    .otherwise(() => <EmptyResult message={homeFeed.failureReason?.message} />)

  return (
    <YStack flex={1} backgroundColor={'$background'}>
      {homeFeedLayout}
    </YStack>
  )
}
