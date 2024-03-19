import { Button, Header, Input, Paragraph, Spinner, View, XStack, YStack } from '@/ui'
import { useMemo, useState } from 'react';
import { Search } from '@tamagui/lucide-icons';
import { trpc } from '@/utils/trpc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderBackButton } from '@react-navigation/elements'
import { EmptyResult } from '@/ui/components/EmptyResult';
import { NoteList } from '@/ui/components/note/NoteList';
import { loading, error, empty, success } from '@/utils/trpc/patterns';
import { match } from 'ts-pattern';
import { useRouter } from 'expo-router';
import { NoteItem } from '@server/modules/note/note';
import { MyHeader } from '@/ui/components/MyHeader';

export const SearchScreen = () => {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const { top } = useSafeAreaInsets()

  // TODO: 
  const TABS = useMemo(
    () => [
      {
        key: 'all',
        title: '全部',
        icon: <></>,
      },
      {
        key: 'note',
        title: '笔记',
        icon: <></>,
      },
      {
        key: 'user',
        title: '用户',
        icon: <></>,
      }
    ],
    [],
  )

  const searchResult = trpc.note.search.useInfiniteQuery({
    keyword,
  }, {
    enabled: false,
    getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
  })

  const searchResultLayout = match(searchResult)
    .with(error, () => <EmptyResult title={searchResult.failureReason?.message} />)
    .with(success, () => (
      <NoteList
        data={searchResult.data?.pages.flatMap(page => page.items) as unknown as NoteItem[]}
        isRefreshing={searchResult.isRefetching}
        onRefresh={() => searchResult.refetch()}
        onEndReached={() => searchResult.fetchNextPage()}
      />
    ))
    .otherwise(() => <></>)


  const handleSearch = () => {
    searchResult.refetch()
  }

  return <>
    <MyHeader backgroundColor={'$background'} showBackButton>
      <XStack flex={1} gap="$1" alignItems='center' backgroundColor={'$gray3'} paddingHorizontal='$2.5' paddingVertical='$2' borderRadius={50}>
        <Search size='$1' />
        <Input flex={1} color="$color" size='$1' defaultValue={keyword} onChangeText={text => setKeyword(text)} unstyled></Input>
      </XStack>
      <Button color={'gray'} unstyled onPress={handleSearch}>搜索</Button>
    </MyHeader>

    <YStack flex={1} backgroundColor={'$background'}>
      {searchResultLayout}
    </YStack>
  </>
}