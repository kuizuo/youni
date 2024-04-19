import { Trash } from 'lucide-react-native'
import { useMemo } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { Box, Button, ButtonIcon, Text, View } from '@gluestack-ui/themed'
import { trpc } from '@/utils/trpc'
import { NoteList } from '@/ui/components/note/NoteList'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'
import { CustomDialog, useDialog } from '@/ui/components/CustomDialog'
import { EmptyResult } from '@/ui/components/EmptyResult'

export function HistoryScreen() {
  const { isOpen, openDialog, closeDialog } = useDialog()

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
    <View
      flex={1}
      bg="$backgroundLight0"
      $dark-bg="$backgroundDark950"
    >
      <NavBar
        left={<NavButton.Back />}
        right={(
          <CustomDialog
            title="确认清空浏览记录?"
            isOpen={isOpen}
            onClose={closeDialog}
            onOk={handleClear}
          >
            <Button size="md" borderRadius="$full" variant="link">
              <ButtonIcon as={Trash} />
            </Button>
          </CustomDialog>
        )}
      >
        <Text flex={1} textAlign="center">浏览记录</Text>
      </NavBar>

      <View flex={1}>
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
      </View>
      {/* <HistoryFooter /> */}
    </View>
  )
}
