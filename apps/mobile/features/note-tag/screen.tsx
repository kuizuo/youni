import { useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import {
  Button,
  ButtonGroup,
  ButtonText,
  Divider,
  HStack,
  Text,
  View,
} from '@gluestack-ui/themed'
import { trpc } from '@/utils/trpc'
import { NoteList } from '@/ui/components/note/NoteList'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'
import { EmptyResult } from '@/ui/components/EmptyResult'

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
      <HStack pt="$3" pb="$3" px="$4" gap="$3" justifyContent="space-between">
        <View className="flex-row gap-2">
          <Text size="2xl" color="$secondary500">#</Text>
          <Text size="2xl">{name}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text size="sm" color="$secondary400">
            {`${noteTag.viewCount} 浏览`}
          </Text>
        </View>
      </HStack>

      <HStack mx="$3" mb="$2" justifyContent="flex-end">
        <ButtonGroup isAttached>
          <Button variant="outline" size="xs" borderColor="$backgroundLight300" borderRightWidth="$0" $dark-borderColor="$backgroundDark700">
            <ButtonText color="$textLight800" $dark-color="$textDark300">
              默认
            </ButtonText>
          </Button>
          <Button variant="outline" size="xs" borderColor="$backgroundLight300" $dark-borderColor="$backgroundDark70">
            <ButtonText color="$textLight800" $dark-color="$textDark300">
              最新
            </ButtonText>
          </Button>
        </ButtonGroup>
      </HStack>

      <Divider mb="$3" />

      <View flex={1}>

        <NoteList
          data={flatedData as unknown as NoteItem[]}
          isRefreshing={isRefetching}
          isFetchingNextPage={isFetchingNextPage}
          onRefresh={() => refetch()}
          onEndReached={() => {
            if (hasNextPage)
              fetchNextPage()
          }}
          ListEmptyComponent={<EmptyResult title="暂无笔记" />}
        >
        </NoteList>
      </View>
    </View>
  )
}
