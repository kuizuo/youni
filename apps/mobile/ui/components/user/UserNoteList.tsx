import type { FlashListProps } from '@shopify/flash-list'
import { FlashList } from '@shopify/flash-list'
import { RefreshControl } from 'react-native-gesture-handler'
import type { NoteItem } from '@server/modules/note/note'
import { UserNoteListItem } from './UserNoteListItem'

interface Props {
  data: NoteItem[]
  isRefreshing: boolean
  onRefresh: () => void
  onEndReached: () => void
  ListEmptyComponent?: FlashListProps<NoteItem>['ListEmptyComponent']
}

export function UserNoteList({
  data,
  isRefreshing,
  onRefresh,
  onEndReached,
  ListEmptyComponent,
}: Props) {
  return (
    <FlashList
      data={data}
      renderItem={({ item }) => <UserNoteListItem {...item}></UserNoteListItem>}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      keyExtractor={item => item.id}
      onEndReached={onEndReached}
      estimatedItemSize={200}
      ListEmptyComponent={ListEmptyComponent}
    />
  )
}
