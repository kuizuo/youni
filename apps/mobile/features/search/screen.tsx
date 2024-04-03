import { useCallback, useMemo, useRef, useState } from 'react'
import { Search, Trash } from '@tamagui/lucide-icons'
import { useAtom } from 'jotai'
import { TextInput, useWindowDimensions } from 'react-native'
import { RESET } from 'jotai/utils'
import type { TabsContentProps } from '@/ui'
import { Button, Input, SizableText, Spinner, Tabs, Text, View, XStack, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'
import { NAV_BAR_HEIGHT, NavBar } from '@/ui/components/NavBar'
import { searchHistoryAtom } from '@/atoms/searchHistroy'
import { NavButton } from '@/ui/components/NavButton'
import { confirm } from '@/utils/confirm'
import { FallbackComponent, QuerySuspense } from '@/ui/components/QuerySuspense'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { NoteList } from '@/ui/components/note/NoteList'
import { UserList } from '@/ui/components/user/UserList'

export function SearchScreen() {
  const [searchText, setSearchText] = useState('')
  const [isSearched, setIsSearched] = useState(false)

  const trimedSearchText = searchText.trim()

  const [searchHistory, setSearchHistory] = useAtom(searchHistoryAtom)

  const inputRef = useRef<TextInput>(null)

  const handleSubmit = useCallback(
    (text: string) => {
      const trimedText = text.trim()
      setIsSearched(true)
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
          if (data.length === 0)
            return <></>

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
                      px="$2.5"
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

  function SearchBar() {
    return (
      <XStack flex={1} gap="$1" ai="center" bg="$gray3" px="$2.5" py="$2" br={50}>
        <Search size="$1" />
        <Input
          ref={inputRef}
          flex={1}
          color="$color"
          size="$1"
          value={searchText}
          onChangeText={(text) => {
            if (text !== searchText) {
              setSearchText(text)
              setIsSearched(true)
            }
          }}
          onBlur={() => {
            setIsSearched(false)
          }}
          onSubmitEditing={() => handleSubmit(searchText)}
          unstyled
        >
        </Input>
      </XStack>
    )
  }

  return (
    <YStack fullscreen bg="$background">
      <NavBar
        left={<NavButton.Back />}
        right={<Button color="gray" unstyled onPress={() => handleSubmit(trimedSearchText)}>搜索</Button>}
      >
        <SearchBar />
      </NavBar>

      {!isSearched
        ? (<SectionList />)
        : (<SearchResult searchText={trimedSearchText}></SearchResult>)}

    </YStack>
  )
}

function SearchResult({ searchText }: { searchText: string }) {
  const window = useWindowDimensions()
  const [searchType, setSearchType] = useState<'note' | 'user'>('note')

  const TabsContent = (props: TabsContentProps) => {
    return (
      <Tabs.Content
        backgroundColor="$background"
        padding="$2"
        alignItems="center"
        justifyContent="center"
        flex={1}
        borderColor="$background"
        borderTopLeftRadius={0}
        borderTopRightRadius={0}
        borderWidth="$2"
        {...props}
      >
        <View style={{ width: window.width - 10, height: '100%' }}>
          {props.children}
        </View>
      </Tabs.Content>
    )
  }

  return (
    <Tabs
      orientation="horizontal"
      flexDirection="column"
      width={window.width}
      height="100%"
      borderRadius="$4"
      borderWidth="$0.25"
      overflow="hidden"
      borderColor="$borderColor"
      defaultValue={searchType}
      onValueChange={value => setSearchType(value as any)}
    >
      <Tabs.List>
        <Tabs.Tab flex={1} value="note" br={0}>
          <SizableText>笔记</SizableText>
        </Tabs.Tab>
        <Tabs.Tab flex={1} value="user" br={0}>
          <SizableText>用户</SizableText>
        </Tabs.Tab>
      </Tabs.List>

      <TabsContent value="note">
        {searchType === 'note' && <SearchNoteList searchText={searchText} />}
      </TabsContent>
      <TabsContent value="user">
        {searchType === 'user' && <SearchUserList searchText={searchText} />}
      </TabsContent>
    </Tabs>
  )
}

function SearchNoteList({ searchText }: { searchText: string }) {
  const [data, { isRefetching, isFetchingNextPage, hasNextPage, refetch, fetchNextPage }] = trpc.note.search.useSuspenseInfiniteQuery({
    keyword: searchText,
    limit: 10,
  }, {
    getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
  })

  const flatedData = useMemo(
    () => data.pages.map(page => page.items).flat() as unknown as any[],
    [data.pages],
  )
  return (
    <QuerySuspense
      loading={<Spinner />}
      fallbackRender={fallbackProps => (
        <View>
          <FallbackComponent {...fallbackProps} />
        </View>
      )}
    >
      <NoteList
        data={flatedData}
        isRefreshing={isRefetching}
        isFetchingNextPage={isFetchingNextPage}
        onRefresh={() => refetch()}
        onEndReached={() => {
          if (hasNextPage)
            fetchNextPage()
        }}
        ListEmptyComponent={<EmptyResult title="没有搜索到相关结果" />}
      >
      </NoteList>
    </QuerySuspense>
  )
}

function SearchUserList({ searchText }: { searchText: string }) {
  const [data, { isRefetching, isFetchingNextPage, hasNextPage, refetch, fetchNextPage }] = trpc.user.search.useSuspenseInfiniteQuery({
    keyword: searchText,
    limit: 10,
  }, {
    getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
  })

  const flatedData = useMemo(
    () => data.pages.map(page => page.items).flat() as unknown as any[],
    [data.pages],
  )
  return (
    <QuerySuspense
      loading={<Spinner />}
      fallbackRender={fallbackProps => (
        <View>
          <FallbackComponent {...fallbackProps} />
        </View>
      )}
    >
      <UserList
        data={flatedData}
        isRefreshing={isRefetching}
        isFetchingNextPage={isFetchingNextPage}
        onRefresh={() => refetch()}
        onEndReached={() => {
          if (hasNextPage)
            fetchNextPage()
        }}
        ListEmptyComponent={<EmptyResult title="没有搜索到相关结果" />}
      >
      </UserList>
    </QuerySuspense>
  )
}
