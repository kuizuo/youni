import { useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { uniqBy } from 'lodash-es'
import { Separator, SizableText, Text, XStack, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { NoteList } from '@/ui/components/note/NoteList'
import { NavBar } from '@/ui/components/NavBar'
import { BackButton } from '@/ui/components/BackButton'

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
    () => uniqBy(data.pages.map(page => page.items).flat(), 'id'),
    [data.pages],
  )

  return (
    <YStack flex={1} bg="$background">
      <NavBar left={<BackButton />} right={<></>} />
      <YStack pt="$6" pb="$3" px="$4" gap="$3">
        <XStack gap="$2">
          <Text fontSize={20} color="gray">#</Text>
          <SizableText fontSize={20}>{name}</SizableText>

        </XStack>
        <XStack jc="space-between">
          <Text fontSize={13} color="gray">
            {`${noteTag.viewCount} 浏览`}
          </Text>
        </XStack>
      </YStack>

      <Separator mb="$3" />

      {/* TODO: 最热/最新 */}
      <NoteList
        data={flatedData}
        isRefreshing={isRefetching}
        isFetchingNextPage={isFetchingNextPage}
        onRefresh={() => refetch()}
        onEndReached={() => {
          if (hasNextPage)
            fetchNextPage()
        }}
      >
      </NoteList>
    </YStack>
  )
}
