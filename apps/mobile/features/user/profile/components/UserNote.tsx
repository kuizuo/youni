import { useMedia } from "@/ui"
import { EmptyResult } from "@/ui/components/EmptyResult"
import { NoteListItem } from "@/ui/components/note/NoteListItem"
import { useUser } from "@/utils/auth/hooks/useUser"
import { trpc } from "@/utils/trpc"
import { NoteItem } from "@server/modules/note/note"
import { MasonryListRenderItem } from "@shopify/flash-list"
import { memo, useCallback, useMemo } from "react"
import { ActivityIndicator, ViewStyle } from "react-native"
import { uniqBy } from 'lodash-es'
import { RefreshControl } from "react-native-gesture-handler"
import { SafeAreaView } from "react-native-safe-area-context"
import Animated from "react-native-reanimated"
import { Tabs } from "react-native-collapsible-tab-view"

const AnimatedMasonryFlashList = Animated.createAnimatedComponent(Tabs.MasonryFlashList)

interface Props {
  contentContainerStyle: ViewStyle
  userId: string
}

export const NoteList = ({ userId, contentContainerStyle }: Props) => {
  const media = useMedia()

  const { currentUser } = useUser()

  const [data, { isRefetching, refetch, isFetchingNextPage, hasNextPage, fetchNextPage }] = trpc.note.userNotes.useSuspenseInfiniteQuery(
    {
      userId,
      limit: 5,
    },
    {
      getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
    }
  )

  const renderItem: MasonryListRenderItem<NoteItem> = useCallback(
    ({ item }) => <NoteListItem {...item}></NoteListItem>,
    []
  )

  const flatedData = useMemo(
    () => uniqBy(data.pages.map(page => page.items).flat(), 'id'),
    [data.pages]
  )

  return <AnimatedMasonryFlashList
    data={flatedData}
    contentContainerStyle={contentContainerStyle}
    showsVerticalScrollIndicator={false}
    refreshControl={
      <RefreshControl
        refreshing={isRefetching}
        onRefresh={() => refetch()}
      />
    }
    onEndReached={() => {
      if (hasNextPage) {
        fetchNextPage()
      }
    }}
    renderItem={renderItem}
    numColumns={media.gtLg ? 4 : media.gtMd ? 3 : 2}
    estimatedItemSize={200}
    ListFooterComponent={
      <SafeAreaView edges={['bottom']}>
        {isFetchingNextPage ? (
          <ActivityIndicator />
        ) : null}
      </SafeAreaView>
    }
    ListEmptyComponent={
      <EmptyResult
        title={currentUser?.id === userId ? '快去创建笔记吧' : '他还没有发布笔记哦'}
      />
    }
  />
}

export const UserNote = memo(NoteList)