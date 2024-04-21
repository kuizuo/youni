import type { FlashListProps, ListRenderItem } from '@shopify/flash-list'
import { FlashList } from '@shopify/flash-list'
import { RefreshControl } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCallback } from 'react'
import { Spinner } from '@gluestack-ui/themed'
import type { TagItem } from '@server/modules/tag/tag'
import { TopicListItem } from './TopicListItem'

interface Props {
  data: TagItem[]
  isRefreshing: boolean
  isFetchingNextPage: boolean
  onRefresh: () => void
  onEndReached: () => void
  ListEmptyComponent?: FlashListProps<TagItem>['ListEmptyComponent']
}

export function TopicList({
  data,
  isRefreshing,
  isFetchingNextPage,
  onRefresh,
  onEndReached,
  ListEmptyComponent,
}: Props) {
  const renderItem: ListRenderItem<TagItem> = useCallback(
    ({ item }) => (
      <TopicListItem {...item}></TopicListItem>
    ),
    [data],
  )

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      keyExtractor={item => item.id}
      onEndReached={onEndReached}
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
      ListEmptyComponent={ListEmptyComponent}
    />
  )
}
