import { match } from 'ts-pattern'
import React from 'react'
import type { MessageItem } from '@server/modules/notification/notification'
import { Paragraph, SizableText, Spinner, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { empty, error, loading, success } from '@/utils/trpc/patterns'
import { MessageList } from '@/ui/components/notification/MessageList'
import { NavBar } from '@/ui/components/NavBar'
import { BackButton } from '@/ui/components/BackButton'

export default function Screen() {
  const messageList = trpc.notification.message.useInfiniteQuery({
    action: 'Follow',
    limit: 10,
  }, {
    getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
  })

  const messageLayout = match(messageList)
    .with(error, () => <EmptyResult title={messageList.failureReason?.message} />)
    .with(loading, () => (
      <YStack fullscreen flex={1} jc="center" ai="center">
        <Paragraph pb="$3">Loading...</Paragraph>
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

  return (
    <YStack flex={1} bg="$background">
      <NavBar left={<BackButton />} right={<></>}>
        <SizableText flex={1} textAlign="center">新增关注</SizableText>
      </NavBar>

      {messageLayout}
    </YStack>
  )
}
