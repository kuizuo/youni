import { FlashList } from '@shopify/flash-list'
import { RefreshControl } from 'react-native-gesture-handler'
import type { NoteItem } from '../../../../server/src/modules/note/note'
import { UserNoteListItem } from './UserNoteListItem'

interface Props {
  data: NoteItem[]
  isRefreshing: boolean
  onRefresh: () => void
  onEndReached: () => void
}

export function UserNoteList({ data, isRefreshing, onRefresh, onEndReached }: Props) {
  return (
    <FlashList
      data={data}
      renderItem={({ item }) => <UserNoteListItem {...item}></UserNoteListItem>}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      onEndReached={onEndReached}
      estimatedItemSize={200}
    />
  )
}
