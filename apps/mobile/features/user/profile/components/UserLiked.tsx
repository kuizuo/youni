import type { NoteItem } from '@server/modules/note/note'
import type { MasonryListRenderItem } from '@shopify/flash-list'
import { memo, useCallback, useMemo } from 'react'
import type { ViewStyle } from 'react-native'
import { uniqBy } from 'lodash-es'
import { RefreshControl } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated from 'react-native-reanimated'
import { Tabs } from 'react-native-collapsible-tab-view'
import { Spinner, useMedia } from '@gluestack-ui/themed'
import { trpc } from '@/utils/trpc'
import { NoteListItem } from '@/ui/components/note/NoteListItem'
import { EmptyResult } from '@/ui/components/EmptyResult'

const AnimatedMasonryFlashList = Animated.createAnimatedComponent(Tabs.MasonryFlashList)

interface Props {
  contentContainerStyle: ViewStyle
  userId: string
}

export function NoteList({ userId, contentContainerStyle }: Props) {
  const media = useMedia()
  const numColumns = media.xl ? 5 : media.lg ? 4 : media.md ? 3 : 2

  const [data, { isRefetching, refetch, isFetchingNextPage, hasNextPage, fetchNextPage }] = trpc.note.userLikedNotes.useSuspenseInfiniteQuery(
    {
      userId,
      limit: 10,
    },
    {
      getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
    },
  )

  const renderItem: MasonryListRenderItem<NoteItem> = useCallback(
    ({ item }) => <NoteListItem {...item}></NoteListItem>,
    [],
  )

  const flatedData = useMemo(
    () => uniqBy(data.pages.map(page => page.items).flat(), 'id'),
    [data.pages],
  )

  return (
    <AnimatedMasonryFlashList
      data={flatedData}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      refreshControl={(
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          progressViewOffset={contentContainerStyle.paddingTop as number}
        />
      )}
      onEndReached={() => {
        if (hasNextPage)
          fetchNextPage()
      }}
      renderItem={renderItem}
      numColumns={numColumns}
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
      ListEmptyComponent={(
        <EmptyResult
          title="还没有赞过笔记哦"
        />
      )}
    />
  )
}

export const UserLiked = memo(NoteList)
