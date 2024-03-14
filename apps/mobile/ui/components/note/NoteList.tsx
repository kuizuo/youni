import { NoteItem } from "@server/modules/note/note"
import { MasonryFlashList } from "@shopify/flash-list"
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, RefreshControl } from "react-native"
import { NoteListItem } from "./NoteListItem"
import { useMedia } from "tamagui"

type Props = {
  data: NoteItem[]
  isRefetching: boolean
  onRefresh?: () => void
  onEndReached?: () => void
}

export const NoteList = ({
  data,
  isRefetching,
  onRefresh,
  onEndReached
}: Props) => {
  const media = useMedia()

  return <MasonryFlashList
    data={data}
    refreshControl={
      <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
    }
    onEndReached={onEndReached}
    renderItem={({ item }) => <NoteListItem {...item}></NoteListItem>}
    numColumns={media.gtLg ? 4 : media.gtMd ? 3 : 2}
    estimatedItemSize={200}
  />
}