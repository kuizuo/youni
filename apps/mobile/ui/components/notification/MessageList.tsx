import { FlashList } from '@shopify/flash-list'
import type { MessageItem } from '@server/modules/notification/notification'
import { RefreshControl } from 'react-native-gesture-handler'
import { MessageListItem } from './MessageListItem'

interface Props {
  data: MessageItem[]
  isRefreshing: boolean
  onRefresh: () => void
  onEndReached: () => void
}

export function MessageList({
  data,
  isRefreshing,
  onRefresh,
  onEndReached,
}: Props) {
  return (
    <FlashList
      data={data}
      renderItem={({ item }) => <MessageListItem {...item}></MessageListItem>}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      onEndReached={onEndReached}
      estimatedItemSize={200}
    />
  )
}
