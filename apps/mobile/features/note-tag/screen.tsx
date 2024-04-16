import { useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { Divider, Text, View } from '@gluestack-ui/themed'
import { trpc } from '@/utils/trpc'
import { NoteList } from '@/ui/components/note/NoteList'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'

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
    <View flex={1}>
      <NavBar left={<NavButton.Back />} right={<></>} />
      <View className="flex-row pt-3 pb-2 px-4 gap-3">
        <View className="flex-row gap-2">
          <Text className="text-xl" color="gray">#</Text>
          <Text className="text-xl">{name}</Text>

        </View>
        <View className="flex-row justify-between">
          <Text fontSize={13} color="gray">
            {`${noteTag.viewCount} 浏览`}
          </Text>
        </View>
      </View>

      <Divider mb="$3" />

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
