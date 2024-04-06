import { useMemo, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import type { TabsContentProps } from '@/ui'
import { SizableText, Spinner, Tabs, View } from '@/ui'
import { trpc } from '@/utils/trpc'
import { FallbackComponent, QuerySuspense } from '@/ui/components/QuerySuspense'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { NoteList } from '@/ui/components/note/NoteList'
import { UserList } from '@/ui/components/user/UserList'

export function SearchResult({ searchText }: { searchText: string }) {
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
