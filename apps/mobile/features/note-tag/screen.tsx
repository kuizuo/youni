import { useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { Separator, Text, View } from '@/ui'
import { trpc } from '@/utils/trpc'
import { NoteList } from '@/ui/components/note/NoteList'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'
import tw from '@/utils/tw'

export default function NoteTagScreen() {
  const { name } = useLocalSearchParams<{ name: string }>()

  const [noteTag] = trpc.noteTag.byName.useSuspenseQuery({ name })

  const [data, { isRefetching, refetch, isFetchingNextPage, hasNextPage, fetchNextPage }] = trpc.note.byTag.useSuspenseInfiniteQuery(
    {
      tag: name,
      limit: 10,
    },
    {
      getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
    },
  )

  const flatedData = useMemo(
    () => data.pages.map(page => page.items).flat(),
    [data.pages],
  )

  return (
    <View style={tw`flex-1 bg-background`}>
      <NavBar left={<NavButton.Back />} right={<></>} />
      <View style={tw`flex-row pt-3 pb-2 px-4 gap-3`}>
        <View style={tw`flex-row gap-2`}>
          <Text style={tw`text-xl`} color="gray">#</Text>
          <Text style={tw`text-xl`}>{name}</Text>

        </View>
        <View style={tw`flex-row justify-between`}>
          <Text fontSize={13} color="gray">
            {`${noteTag.viewCount} 浏览`}
          </Text>
        </View>
      </View>

      <Separator mb="$3" />

      {/* TODO: 最热/最新 */}
      <NoteList
        data={flatedData as unknown as NoteItem[]}
        isRefreshing={isRefetching}
        isFetchingNextPage={isFetchingNextPage}
        onRefresh={() => refetch()}
        onEndReached={() => {
          if (hasNextPage)
            fetchNextPage()
        }}
      >
      </NoteList>
    </View>
  )
}
