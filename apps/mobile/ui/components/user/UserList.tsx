import { FlashList } from '@shopify/flash-list'
import type { UserInfo } from '@server/modules/user/user'
import { RefreshControl } from 'react-native-gesture-handler'
import { UserListItem } from './UserListItem'

interface Props {
  data: UserInfo[]
  isRefreshing: boolean
  onRefresh: () => void
  onEndReached: () => void
}

export function UserList({ data, isRefreshing, onRefresh, onEndReached }: Props) {
  return (
    <FlashList
      data={data}
      renderItem={({ item }) => <UserListItem {...item}></UserListItem>}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      onEndReached={onEndReached}
      estimatedItemSize={200}
    />
  )
}
