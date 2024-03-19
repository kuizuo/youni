import { Paragraph, SizableText, Spinner, View, YStack } from '@/ui';
import { trpc } from '@/utils/trpc';
import { EmptyResult } from '@/ui/components/EmptyResult';
import { empty, error, loading, success } from '@/utils/trpc/patterns';
import { match } from 'ts-pattern';
import React from 'react';
import { MessageItem } from '@server/modules/notification/notification';
import { MessageList } from '@/ui/components/notification/MessageList';
import { MyHeader } from '@/ui/components/MyHeader';

export default function Screen() {
  const messageList = trpc.notification.message.useInfiniteQuery({
    action: 'Comment',
    limit: 10,
  }, {
    getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
  })

  const messageLayout = match(messageList)
    .with(error, () => <EmptyResult title={messageList.failureReason?.message} />)
    .with(loading, () => (
      <YStack fullscreen flex={1} justifyContent='center' alignItems='center'>
        <Paragraph paddingBottom='$3'>Loading...</Paragraph>
        <Spinner />
      </YStack>
    ))
    .with(empty, () => <Paragraph>没有任何浏览记录</Paragraph>)
    .with(success, () => (
      <MessageList
        data={messageList.data?.pages.flatMap(page => page.items) as unknown as MessageItem[]}
        isRefreshing={messageList.isRefetching}
        onRefresh={() => messageList.refetch()}
        onEndReached={() => messageList.fetchNextPage()}
      />
    ))
    .otherwise(() => <EmptyResult title={messageList.failureReason?.message} />)

  return <YStack flex={1} backgroundColor={'$background'}>
    <MyHeader showBackButton headerRight={<View width={'$1.5'} />}>
      <SizableText flex={1} textAlign="center">评论</SizableText>
    </MyHeader>
    {messageLayout}
  </YStack>
}