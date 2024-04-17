import type { FlashListProps } from '@shopify/flash-list'
import { FlashList } from '@shopify/flash-list'
import type { MessageItem } from '@server/modules/notification/notification'
import { RefreshControl } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Spinner } from '@gluestack-ui/themed'
import { MessageListItem } from './MessageListItem'

interface Props {
  data: MessageItem[]
  isRefreshing: boolean
  isFetchingNextPage: boolean
  onRefresh: () => void
  onEndReached: () => void
  ListEmptyComponent?: FlashListProps<any>['ListEmptyComponent']
}

export function MessageList({
  data,
  isRefreshing,
  isFetchingNextPage,
  onRefresh,
  onEndReached,
  ListEmptyComponent,
}: Props) {
  return (
    <FlashList
      data={data}
      renderItem={({ item }) => <MessageListItem {...item}></MessageListItem>}
      keyExtractor={item => item.id}
      refreshControl={(
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      )}
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
