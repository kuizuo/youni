import { FlashList } from "@shopify/flash-list"
import { UserNoteListItem } from "./UserNoteListItem"
import { RefreshControl } from "react-native-gesture-handler"
import { NoteItem } from "../../../../server/src/modules/note/note"

type Props = {
  data: NoteItem[]
  isRefreshing: boolean
  onRefresh: () => void
  onEndReached: () => void
}

export const UserNoteList = ({ data,
  isRefreshing,
  onRefresh,
  onEndReached
}: Props) => {
  return <FlashList
    data={data}
    renderItem={({ item }) => <UserNoteListItem {...item}></UserNoteListItem>}
    keyExtractor={(item) => item.id}
    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    onEndReached={onEndReached}
    estimatedItemSize={200}
  />
}