import type { FlashListProps, ListRenderItem } from '@shopify/flash-list'
import { FlashList } from '@shopify/flash-list'
import type { UserInfo } from '@server/modules/user/user'
import { RefreshControl } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCallback } from 'react'
import { Spinner } from '@gluestack-ui/themed'
import { UserListItem } from './UserListItem'

interface Props {
  data: UserInfo[]
  isRefreshing: boolean
  isFetchingNextPage: boolean
  onRefresh: () => void
  onEndReached: () => void
  ListEmptyComponent?: FlashListProps<UserInfo>['ListEmptyComponent']
}

export function UserList({
  data,
  isRefreshing,
  isFetchingNextPage,
  onRefresh,
  onEndReached,
  ListEmptyComponent,
}: Props) {
  const renderItem: ListRenderItem<UserInfo> = useCallback(
    ({ item }) => (
      <UserListItem {...item}></UserListItem>
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
