import React, { useMemo } from 'react'
import type { MessageItem } from '@server/modules/notification/notification'
import { Text, View } from '@gluestack-ui/themed'
import { trpc } from '@/utils/trpc'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { MessageList } from '@/ui/components/notification/MessageList'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'

export default function Screen() {
  const [data, { isRefetching, isFetchingNextPage, hasNextPage, refetch, fetchNextPage }] = trpc.notification.message.useSuspenseInfiniteQuery(
    {
      action: 'System',
      limit: 10,
    },
    {
      getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
    },
  )

  const flatedData = useMemo(
    () => data.pages.map(page => page.items).flat() as unknown as MessageItem[],
    [data.pages],
  )

  return (
    <View flex={1}>
      <NavBar left={<NavButton.Back />} right={<></>}>
        <Text flex={1} textAlign="center">消息通知</Text>
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
    </View>
  )
}
