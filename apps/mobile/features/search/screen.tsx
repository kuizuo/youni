import { useState } from 'react'
import { Search } from '@tamagui/lucide-icons'
import { match } from 'ts-pattern'
import { NoteItem } from '@server/modules/note/note'
import { useAtom } from 'jotai'
import { Button, Input, Spinner, XStack, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { NoteList } from '@/ui/components/note/NoteList'
import { dataNotFetched, empty, error, loading } from '@/utils/trpc/patterns'
import { NavBar } from '@/ui/components/NavBar'
import { searchHistoryAtom } from '@/atoms/searchHistroy'
import { BackButton } from '@/ui/components/BackButton'

export function SearchScreen() {
  const [keyword, setKeyword] = useState('')
  const [result, setResult] = useState<NoteItem[]>([])

  const [searchHistory, setSearchHistory] = useAtom(searchHistoryAtom)

  const searchResult = trpc.note.search.useQuery({
    keyword,
  }, {
    enabled: false,
  })

  const searchResultLayout = match(searchResult)
    .with(error, () => <EmptyResult title={searchResult.failureReason?.message} />)
    .with(dataNotFetched, () => <></>)
    .with(loading, () => <Spinner />)
    .with(empty, () => <EmptyResult title="没有找到相关内容" />)
    .otherwise(() => <EmptyResult title={searchResult.failureReason?.message} />)

  const handleSearch = async (text: string) => {
    if (text.length > 0) {
      await searchResult.refetch()

      setSearchHistory([...searchHistory, keyword])
      setResult(searchResult.data?.items as unknown as NoteItem[])
    }
  }

  return (
    <YStack fullscreen backgroundColor="$background">
      <NavBar
        left={<BackButton />}
        right={<Button color="gray" unstyled onPress={() => handleSearch(keyword)}>搜索</Button>}
      >
        <XStack flex={1} gap="$1" alignItems="center" backgroundColor="$gray3" paddingHorizontal="$2.5" paddingVertical="$2" borderRadius={50}>
          <Search size="$1" />
          <Input
            flex={1}
            color="$color"
            size="$1"
            onChangeText={(text) => {
              if (text !== keyword)
                setKeyword(text)
            }}
            onSubmitEditing={() => handleSearch(keyword)}
            unstyled
          >
          </Input>
        </XStack>
      </NavBar>

      <YStack flex={1}>
        {searchResultLayout}

        {result.length > 0 && (
          <>
            <NoteList
              data={result as unknown as NoteItem[]}
              isRefreshing={searchResult.isRefetching}
              onRefresh={() => searchResult.refetch()}
            />
          </>
        )}
      </YStack>
    </YStack>
  )
}
