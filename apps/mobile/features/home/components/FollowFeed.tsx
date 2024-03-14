import { EmptyResult } from '@/ui/components/EmptyResult'
import { Paragraph, Spinner, View, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { empty, error, loading, success } from '@/utils/trpc/patterns'
import React from 'react'
import { match } from 'ts-pattern'
import { NoteList } from '@/ui/components/note/NoteList'
import { NoteItem } from '@server/modules/note/note'

export const FollowFeed = (): React.ReactNode => {
  const followFeed = trpc.note.followFeed.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
    }
  );

  const followFeedLayout = match(followFeed)
    .with(error, () => <EmptyResult message={followFeed.failureReason?.message} />)
    .with(loading, () => (
      <YStack fullscreen flex={1} justifyContent='center' alignItems='center'>
        <Paragraph paddingBottom='$3'>Loading...</Paragraph>
        <Spinner />
      </YStack>
    ))
    .with(empty, () => <View flex={1} justifyContent='center'>
      <Paragraph>还没有关注的用户</Paragraph>
      <Paragraph fontSize={10} >关注后可查看他的最新动态</Paragraph>
    </View>
    )
    .with(success, () => (
      <NoteList
        data={followFeed.data?.pages.flatMap(page => page.items) as unknown as NoteItem[]}
        isRefetching={followFeed.isRefetching}
        onRefresh={() => followFeed.refetch()}
        onEndReached={() => followFeed.fetchNextPage()}
      />
    ))
    .otherwise(() => <EmptyResult message={followFeed.failureReason?.message} />)

  return (
    <YStack flex={1} backgroundColor={'$background'}>
      <View flex={1} justifyContent='center' alignItems='center' marginTop="$4">
        <Paragraph>还没有关注的用户</Paragraph>
        <Paragraph fontSize={10}>关注后可查看他的最新动态</Paragraph>
      </View>
    </YStack>
  )
}
