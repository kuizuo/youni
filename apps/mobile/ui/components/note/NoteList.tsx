import type { NoteItem } from '@server/modules/note/note'
import { MasonryFlashList } from '@shopify/flash-list'
import { RefreshControl } from 'react-native'
import { useMedia } from 'tamagui'
import { NoteListItem } from './NoteListItem'

interface Props {
  data: NoteItem[]
  isRefreshing: boolean
  onRefresh?: () => void
  onEndReached?: () => void
}

export function NoteList({
  data,
  isRefreshing,
  onRefresh,
  onEndReached,
}: Props) {
  const media = useMedia()

  return (
    <MasonryFlashList
      data={data}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
    }
      onEndReached={onEndReached}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <NoteListItem {...item}></NoteListItem>}
      numColumns={media.gtLg ? 4 : media.gtMd ? 3 : 2}
      estimatedItemSize={200}
    />
  )
}
