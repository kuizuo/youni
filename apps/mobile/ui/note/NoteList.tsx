import { InteractedNote } from "@server/modules/note/note"
import { MasonryFlashList } from "@shopify/flash-list"
import { RefreshControl } from "react-native"
import { NoteListItem } from "./NoteListItem"
import { useMedia } from "tamagui"

type Props = {
  data: InteractedNote[]
  isLoading: boolean
}

export const NoteList = ({ data, isLoading }: Props) => {
  const media = useMedia()

  return <MasonryFlashList
    data={data}
    refreshControl={
      <RefreshControl refreshing={isLoading} />
    }
    refreshing={isLoading}
    renderItem={({ item }) => <NoteListItem {...item}></NoteListItem>}
    numColumns={media.gtLg ? 4 : media.gtMd ? 3 : 2}
    estimatedItemSize={200}
  />
}