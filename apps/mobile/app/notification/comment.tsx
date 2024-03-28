import React, { useMemo } from 'react'
import type { MessageItem } from '@server/modules/notification/notification'
import { SizableText, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { MessageList } from '@/ui/components/notification/MessageList'
import { NavBar } from '@/ui/components/NavBar'
import { BackButton } from '@/ui/components/BackButton'

export default function Screen() {
  const [data, { isRefetching, isFetchingNextPage, hasNextPage, refetch, fetchNextPage }] = trpc.notification.message.useSuspenseInfiniteQuery({
    action: 'Comment',
    limit: 10,
  }, {
    getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
  })

  const flatedData = useMemo(
    () => data.pages.map(page => page.items).flat() as unknown as MessageItem[],
    [data.pages],
  )

  return (
    <YStack flex={1} bg="$background">
      <NavBar left={<BackButton />} right={<></>}>
        <SizableText flex={1} textAlign="center">评论</SizableText>
      </NavBar>
      <MessageList
        data={flatedData}
        isRefreshing={isRefetching}
        onRefresh={() => refetch()}
        onEndReached={() => {
          if (hasNextPage)
            fetchNextPage()
        }}
        isFetchingNextPage={isFetchingNextPage}
        ListEmptyComponent={<EmptyResult title="暂无消息" />}
      />
    </YStack>
  )
}
