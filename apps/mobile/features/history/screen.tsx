import { match } from 'ts-pattern'
import type { NoteItem } from '@server/modules/note/note'
import { List } from '@tamagui/lucide-icons'
import { Stack } from 'expo-router'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { HistoryFooter } from './HistoryFooter'
import { Button, Paragraph, Spinner, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { empty, error, loading, success } from '@/utils/trpc/patterns'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { NoteList } from '@/ui/components/note/NoteList'
import { historyStateAtoms } from '@/atoms/history'

export function HistoryScreen() {
  const historyList = trpc.history.list.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
    },
  )

  const [isManageMode, setIsManageMode] = useAtom(historyStateAtoms.isManageMode)
  const [_, setItems] = useAtom(historyStateAtoms.items)

  useEffect(() => {
    if (historyList.isSuccess && historyList.data) {
      const items = historyList.data.pages.flatMap(page => page.items) as unknown as NoteItem[]

      setItems(prevSelectedItems => [...new Set([...prevSelectedItems, ...items.map(item => item.id)])])
    }
  }, [historyList.isSuccess, historyList.data])

  const noteListLayout = match(historyList)
    .with(error, () => <EmptyResult title={historyList.failureReason?.message} />)
    .with(loading, () => (
      <YStack fullscreen flex={1} justifyContent="center" alignItems="center">
        <Paragraph paddingBottom="$3">Loading...</Paragraph>
        <Spinner />
      </YStack>
    ))
    .with(empty, () => <Paragraph>没有任何浏览记录</Paragraph>)
    .with(success, () => (
      <NoteList
        data={historyList.data?.pages.flatMap(page => page.items) as unknown as NoteItem[]}
        isRefreshing={historyList.isRefetching}
        onRefresh={() => historyList.refetch()}
        onEndReached={() => historyList.fetchNextPage()}
      />
    ))
    .otherwise(() => <EmptyResult title={historyList.failureReason?.message} />)

  return (
    <YStack fullscreen flex={1} backgroundColor="$background">
      <Stack.Screen options={{
        headerShown: true,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        title: '浏览记录',
        headerTitleAlign: 'center',
        headerRight: () => {
          return (
            <>
              {
            !isManageMode
              ? (
                <Button
                  size="$2"
                  borderRadius={50}
                  marginRight="$2"
                  icon={<List />}
                  onPress={() => setIsManageMode(true)}
                >
                  管理
                </Button>
                )
              : (
                <Button
                  size="$2"
                  color="$accent10"
                  onPress={() => {
                    setIsManageMode(false)
                  }}
                >
                  完成
                </Button>
                )
          }
            </>
          )
        },
      }}
      />
      <YStack flex={1}>
        {noteListLayout}
      </YStack>
      <HistoryFooter />
    </YStack>
  )
}
