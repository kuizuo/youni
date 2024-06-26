import { useCallback, useMemo } from 'react'
import type { ListRenderItem } from '@shopify/flash-list'
import { FlashList } from '@shopify/flash-list'
import type { UserInfoWithFollow } from '@server/modules/interact/interact'
import { RefreshControl } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Spinner, View } from '@gluestack-ui/themed'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { trpc } from '@/utils/trpc'
import { UserListItem } from '@/ui/components/user/UserListItem'

interface Props {
  userId: string
  type: 'following' | 'followers'
}

export function FollowerList({ userId, type }: Props) {
  const [data, { isRefetching, isFetchingNextPage, refetch, hasNextPage, fetchNextPage }] = trpc.interact[type].useSuspenseInfiniteQuery(
    {
      id: userId,
      limit: 10,
    },
    {
      getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
    },
  )

  const flatedData = useMemo(
    () => data.pages.map(page => page.items).flat(),
    [data.pages],
  )

  const renderItem: ListRenderItem<UserInfoWithFollow> = useCallback(
    ({ item }) => <UserListItem {...item}></UserListItem>,
    [],
  )

  return (
    <View flex={1}>
      <FlashList
        data={flatedData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        onEndReached={() => {
          if (hasNextPage)
            fetchNextPage()
        }}
        estimatedItemSize={200}
        ListFooterComponent={(
          <SafeAreaView edges={['bottom']}>
            {isFetchingNextPage
              ? <Spinner />
              : null}
          </SafeAreaView>
        )}
        ListEmptyComponent={
          <EmptyResult title={type === 'following' ? '你还没有关注任何人' : '你还没有粉丝'} />
        }
      />
    </View>
  )
}
