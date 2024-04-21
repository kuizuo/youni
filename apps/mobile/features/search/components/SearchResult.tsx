import { useMemo, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import {
  Spinner,
  View,
} from '@gluestack-ui/themed'
import { TabBar, TabView } from 'react-native-tab-view'
import { trpc } from '@/utils/trpc'
import { FallbackComponent, QuerySuspense } from '@/ui/components/QuerySuspense'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { NoteList } from '@/ui/components/note/NoteList'
import { UserList } from '@/ui/components/user/UserList'
import { TopicList } from '@/ui/components/topic/TopicList'
import { useColor } from '@/utils/theme'

export function SearchResult({ searchText }: { searchText: string }) {
  const { primaryColor, bgColor } = useColor()

  const window = useWindowDimensions()
  const [searchType, setSearchType] = useState<'note' | 'user'>('note')

  const [index, setIndex] = useState(0)

  const TABS = useMemo(
    () => [
      {
        key: 'note',
        title: '笔记',
      },
      {
        key: 'topic',
        title: '话题',
      },
      {
        key: 'user',
        title: '用户',
      },
    ],
    [],
  )

  return (
    <TabView
      navigationState={{ index, routes: TABS }}
      onIndexChange={setIndex}
      initialLayout={{ width: window.width }}
      renderScene={({ route }) => {
        switch (route.key) {
          case 'note':
            return <SearchNoteList searchText={searchText} />
          case 'topic':
            return <SearchTopicList searchText={searchText} />
          case 'user':
            return <SearchUserList searchText={searchText} />
          default:
            return null
        }
      }}
      renderTabBar={(props) => {
        return (
          <TabBar
            {...props}
            tabStyle={{ width: window.width / TABS.length }}
            labelStyle={{ color: 'black' }}
            indicatorStyle={{ backgroundColor: primaryColor }}
            style={{ backgroundColor: bgColor, marginBottom: 4 }}
          />
        )
      }}
    />

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

function SearchTopicList({ searchText }: { searchText: string }) {
  const [data, { isRefetching, isFetchingNextPage, hasNextPage, refetch, fetchNextPage }] = trpc.tag.search.useSuspenseInfiniteQuery({
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
      <TopicList
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
      </TopicList>
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
