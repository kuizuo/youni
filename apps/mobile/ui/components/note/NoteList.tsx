import type { NoteItem } from '@server/modules/note/note'
import type { FlashListProps, MasonryListRenderItem } from '@shopify/flash-list'
import { MasonryFlashList } from '@shopify/flash-list'
import { useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { RefreshControl } from 'react-native-gesture-handler'
import { NoteListItem } from './NoteListItem'
import { Spinner, useMedia } from '@/ui'

interface Props {
  data: NoteItem[]
  isRefreshing: boolean
  isFetchingNextPage?: boolean
  onRefresh?: () => void
  onEndReached?: () => void
  ListEmptyComponent?: FlashListProps<NoteItem>['ListEmptyComponent']
}

export function NoteList({
  data,
  isRefreshing,
  isFetchingNextPage,
  onRefresh,
  onEndReached,
  ListEmptyComponent,
}: Props) {
  const media = useMedia()

  const renderItem: MasonryListRenderItem<NoteItem> = useCallback(
    ({ item }) => <NoteListItem {...item}></NoteListItem>,
    [],
  )

  return (
    <MasonryFlashList
      data={data}
      showsVerticalScrollIndicator={false}
      refreshControl={(
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      )}
      onEndReached={onEndReached}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      numColumns={media.gtLg ? 4 : media.gtMd ? 3 : 2}
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
