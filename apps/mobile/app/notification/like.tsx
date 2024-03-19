import { Paragraph, Spinner, YStack } from '@/ui';
import { trpc } from '@/utils/trpc';
import { EmptyResult } from '@/ui/components/EmptyResult';
import { empty, error, loading, success } from '@/utils/trpc/patterns';
import { match } from 'ts-pattern';
import React from 'react';
import { MessageItem } from '@server/modules/notification/notification';
import { Stack } from 'expo-router';
import { MessageList } from '@/ui/components/notification/MessageList';

export default function Screen() {

  const messageList = trpc.notification.message.useInfiniteQuery({
    action: 'Like',
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

  return <YStack flex={1} backgroundColor={'$background'} >
    <Stack.Screen options={{
      headerShown: true,
      headerShadowVisible: false,
      title: '赞',
      headerTitleAlign: 'center'
    }} />
    {messageLayout}
  </YStack>
}