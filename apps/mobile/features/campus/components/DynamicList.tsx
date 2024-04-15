import { memo, useCallback, useMemo } from 'react'
import type { ListRenderItem } from '@shopify/flash-list'
import { RefreshControl } from 'react-native-gesture-handler'
import type { NoteItem } from '@server/modules/note/note'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { ViewStyle } from 'react-native'
import { Tabs } from 'react-native-collapsible-tab-view'
import { Spinner } from '@gluestack-ui/themed'
import { DynamicListItem } from './DynamicListItem'
import { useCurrentCampus } from '@/atoms/campus'
import { trpc } from '@/utils/trpc'
import { EmptyResult } from '@/ui/components/EmptyResult'

export function DynamicListComp({ contentContainerStyle }: { contentContainerStyle: ViewStyle }) {
  const [currentCampus, setCurrentCampus] = useCurrentCampus()

  const [data, { isRefetching, isFetchingNextPage, hasNextPage, refetch, fetchNextPage }] = trpc.note.byCampus.useSuspenseInfiniteQuery(
    {
      campusId: currentCampus?.id,
      limit: 10,
    },
    {
      getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
    },
  )

  const flatedData = useMemo(
    () => data.pages.map(page => page.items).flat() as unknown as NoteItem[],
    [data.pages],
  )

  const renderItem: ListRenderItem<NoteItem> = useCallback(
    ({ item }) => (
      <DynamicListItem item={item as NoteItem} />
    ),
    [data],
  )

  return (
    <Tabs.FlashList
      data={flatedData}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
      onEndReached={() => {
        if (hasNextPage)
          fetchNextPage()
      }}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      estimatedItemSize={200}
      ListFooterComponent={(
        <SafeAreaView edges={['bottom']}>
          {isFetchingNextPage
            ? (
              <Spinner />
              )
            : null}
        </SafeAreaView>
      )}
      ListEmptyComponent={<EmptyResult title="暂无动态" />}
    />

  )
}

export const DynamicList = memo(DynamicListComp)
