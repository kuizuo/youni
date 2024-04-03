import { useCallback, useMemo, useRef, useState } from 'react'
import { Search, Trash } from '@tamagui/lucide-icons'
import { NoteItem } from '@server/modules/note/note'
import { useAtom } from 'jotai'
import { TextInput } from 'react-native'
import type { ListRenderItem } from '@shopify/flash-list'
import { RESET } from 'jotai/utils'
import { Button, Input, Spinner, Text, View, XStack, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { NoteList } from '@/ui/components/note/NoteList'
import { NAV_BAR_HEIGHT, NavBar, useNavBarHeight } from '@/ui/components/NavBar'
import { searchHistoryAtom } from '@/atoms/searchHistroy'
import { NavButton } from '@/ui/components/NavButton'
import { confirm } from '@/utils/confirm'

export function SearchScreen() {
  const navbarHeight = useNavBarHeight()
  const [searchText, setSearchText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchType, setSearchType] = useState<'note' | 'user'>('note')

  const trimedSearchText = searchText.trim()

  const [searchHistory, setSearchHistory] = useAtom(searchHistoryAtom)

  const inputRef = useRef<TextInput>(null)

  // const searchResult = trpc[searchType].search.useQuery({
  //   keyword: searchText,
  //   limit: true,
  // }, {
  //   enabled: false,
  // })

  const handleSubmit = useCallback(
    (text: string) => {
      const trimedText = text.trim()
      setIsSearching(!trimedText)
      setSearchText(trimedText)

      if (trimedText) {
        setSearchHistory(prev => [
          trimedText,
          ...(prev.includes(trimedText)
            ? prev.filter(o => o !== trimedText)
            : prev.slice(0, 9)),
        ])
      }
    },
    [setSearchHistory],
  )

  const sections = useMemo(() => {
    return [
      {
        key: 'history',
        title: '搜索历史',
        data: searchHistory,
      },
      // {
      //   key: 'recommend',
      //   title: '猜你想搜',
      //   data: [],
      // },
    ]
  }, [searchHistory])

  function SectionList() {
    return (
      <>
        {sections.map(({ key, title, data }) => {
          return (
            <View flex={1} key={key}>
              <View h={NAV_BAR_HEIGHT} mx="$3" fd="row" jc="space-between" ai="center">
                <Text color="$gray9">
                  {title}
                </Text>
                <Trash
                  color="$gray9"
                  size="$1"
                  onPress={async () => {
                    try {
                      await confirm('确认清除搜索历史吗')
                      setSearchHistory(RESET)
                    }
                    catch (error) {
                      // empty
                    }
                  }}
                />
              </View>
              <View fd="row" mx="$3" gap="$2.5">
                {data.map((item, index) => {
                  return (
                    <View
                      key={item}
                      bw={1}
                      boc="$gray10"
                      br="$4"
                      px="$2"
                      py="$1.5"
                      onPress={() => {
                        handleSubmit(item)
                      }}
                    >
                      <Text color="$gray11">
                        {item}
                      </Text>
                    </View>
                  )
                })}
              </View>
            </View>
          )
        }) }
      </>
    )
  }

  return (
    <YStack fullscreen bg="$background">
      <NavBar
        left={<NavButton.Back />}
        right={<Button color="gray" unstyled onPress={() => handleSubmit(searchText)}>搜索</Button>}
      >
        <XStack flex={1} gap="$1" ai="center" bg="$gray3" px="$2.5" py="$2" br={50}>
          <Search size="$1" />
          <Input
            ref={inputRef}
            flex={1}
            color="$color"
            size="$1"
            onChangeText={(text) => {
              if (text !== searchText)
                setSearchText(text)
            }}
            onSubmitEditing={() => handleSubmit(searchText)}
            unstyled
          >
          </Input>
        </XStack>
      </NavBar>

      {isSearching
        ? <SectionList />
        : (
          <>

          </>
          )}

      {/* <YStack flex={1}>
        {searchResultLayout}

        <NoteList
          data={result as unknown as NoteItem[]}
          isRefreshing={searchResult.isRefetching}
          onRefresh={() => searchResult.refetch()}
        />
      </YStack> */}
    </YStack>
  )
}

function SearchNoteList() {

}

function SearchUserList() {

}
