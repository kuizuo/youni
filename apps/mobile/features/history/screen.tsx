import { Trash } from 'lucide-react-native'
import { useMemo } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { Button, View } from '@gluestack-ui/themed'
import { trpc } from '@/utils/trpc'
import { NoteList } from '@/ui/components/note/NoteList'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'
import { CustomDialog } from '@/ui/components/CustomDialog'
import { EmptyResult } from '@/ui/components/EmptyResult'

export function HistoryScreen() {
  const [data, { isRefetching, refetch, isFetchingNextPage, hasNextPage, fetchNextPage }] = trpc.history.list.useSuspenseInfiniteQuery({
    limit: 10,
  }, {
    getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
  })

  const { mutateAsync } = trpc.history.clear.useMutation({})

  const flatedData = useMemo(
    () => data.pages.map(page => page.items).flat(),
    [data.pages],
  )

  const handleClear = async () => {
    await mutateAsync()
    await refetch()
  }

  return (
    <View flex={1}>
      <NavBar
        left={<NavButton.Back />}
        right={(
          <CustomDialog title="确认清空浏览记录?" onOk={handleClear}>
            <Button
              size="$2"
              br={50}
              icon={<Trash />}
            >
            </Button>
          </CustomDialog>
        )}
      >
        <Text flex={1} textAlign="center">浏览记录</Text>
      </NavBar>
      <NoteList
        data={flatedData as unknown as NoteItem[]}
        isRefreshing={isRefetching}
        isFetchingNextPage={isFetchingNextPage}
        onRefresh={() => refetch()}
        onEndReached={() => {
          if (hasNextPage)
            fetchNextPage()
        }}
        ListEmptyComponent={<EmptyResult title="没有任何浏览记录" />}
      >
      </NoteList>
      {/* <HistoryFooter /> */}
    </View>
  )
}
