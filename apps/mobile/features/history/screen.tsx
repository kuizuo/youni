import { Trash } from '@tamagui/lucide-icons'
import { useMemo } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { Button, EmptyResult, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { NoteList } from '@/ui/components/note/NoteList'
import { NavBar } from '@/ui/components/NavBar'
import { BackButton } from '@/ui/components/BackButton'
import { CustomDialog } from '@/ui/components/CustomDialog'

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
    <YStack fullscreen flex={1} bg="$background">
      <NavBar
        left={<BackButton />}
        right={(
          <CustomDialog title="确认清空浏览记录?" onOk={handleClear}>
            <Button
              size="$2"
              br={50}
              marginRight="$2"
              icon={<Trash />}
            >
            </Button>
          </CustomDialog>
        )}
      >
        浏览记录
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
    </YStack>
  )
}
