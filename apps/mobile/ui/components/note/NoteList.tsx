import { NoteItem } from "@server/modules/note/note"
import { MasonryFlashList } from "@shopify/flash-list"
import { RefreshControl } from "react-native"
import { NoteListItem } from "./NoteListItem"
import { useMedia } from "tamagui"

type Props = {
  data: NoteItem[]
  isRefreshing: boolean
  onRefresh?: () => void
  onEndReached?: () => void
}

export const NoteList = ({
  data,
  isRefreshing,
  onRefresh,
  onEndReached
}: Props) => {
  const media = useMedia()

  return <MasonryFlashList
    data={data}
    refreshControl={
      <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
    }
    onEndReached={onEndReached}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => <NoteListItem {...item}></NoteListItem>}
    numColumns={media.gtLg ? 4 : media.gtMd ? 3 : 2}
    estimatedItemSize={200}
  />
}