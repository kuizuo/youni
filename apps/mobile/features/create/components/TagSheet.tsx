import { memo, useCallback, useMemo, useState } from 'react'
import { CheckCircle, Circle, Search } from '@tamagui/lucide-icons'
import { useAtom } from 'jotai'
import type { ListRenderItem } from '@shopify/flash-list'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NoteTag } from '@youni/database'
import { Button, Input, Separator, Sheet, SizableText, Spinner, View, XStack } from '@/ui'

import { trpc } from '@/utils/trpc'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { selectTagsAtom, tagSheetOpenAtom } from '@/atoms/create'

export const TagSheet = memo(() => {
  const [open, setOpen] = useAtom(tagSheetOpenAtom)

  const [searchText, setSearchText] = useState<string>('')

  const [selectTags, setSelectTags] = useAtom(selectTagsAtom)

  const [data, { refetch, isFetchingNextPage, hasNextPage, fetchNextPage }] = trpc.noteTag.search.useSuspenseInfiniteQuery({
    name: searchText,
    limit: 10,
  }, {
    getNextPageParam: lastPage => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
  })

  const handleSearch = (text: string) => {
    refetch()
  }

  const flatedData = useMemo(
    () => data.pages.map(page => page.items).flat() as unknown as NoteTag[],
    [data.pages],
  )

  const renderItem: ListRenderItem<NoteTag> = useCallback(
    ({ item }) => (
      <TagItem item={item} />
    ),
    [data],
  )

  const handleAddTag = () => {
    setSelectTags(prev => [...prev, searchText])
    setSearchText('')
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={setOpen}
      snapPoints={[50]}
      snapPointsMode="percent"
      dismissOnSnapToBottom
      dismissOnOverlayPress
      position={0}
      zIndex={100_000}
      animation="medium"
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 50 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame p="$4" jc="center" ai="center" gap="$5">
        <XStack
          width="100%"
          ai="center"
          bg="$gray3"
          px="$2.5"
          py="$2.5"
          gap="$2"
        >
          <Search size="$1" />
          <Input
            placeholder="搜索"
            onChangeText={(text) => {
              if (text !== searchText)
                setSearchText(text.trim())
            }}
            textAlignVertical="center"
            onSubmitEditing={() => handleSearch(searchText)}
            autoFocus={open}
            unstyled
          >
          </Input>
        </XStack>

        <View flex={1} width="100%">
          <FlashList
            data={flatedData}
            renderItem={renderItem}
            onEndReached={() => {
              if (hasNextPage)
                fetchNextPage()
            }}
            style={{
              flex: 1,
              width: '100%',
            }}
            estimatedItemSize={300}
            ListFooterComponent={(
              <SafeAreaView edges={['bottom']}>
                {isFetchingNextPage
                  ? (
                    <Spinner />
                    )
                  : null}
              </SafeAreaView>
            )}
            ListEmptyComponent={(
              <>
                <EmptyResult title={`没有关于[${searchText}]的话题`} />
                <Button width="" onPress={handleAddTag}>
                  添加该话题
                </Button>
              </>
            )}
          >
          </FlashList>
        </View>
        <Separator />
      </Sheet.Frame>
    </Sheet>
  )
})

const TagItem = memo(({ item }: { item: NoteTag }) => {
  const [selectTags, setSelectTags] = useAtom(selectTagsAtom)

  const handleSelect = () => {
    if (selectTags.includes(item.name))
      setSelectTags(prev => prev.filter(tag => tag !== item.name))
    else
      setSelectTags(prev => [...prev, item.name])
  }
  return (
    <View flexDirection="row" width="100%" jc="space-between" onPress={handleSelect}>
      <SizableText flex={1} className="text-base">
        {`# ${item.name}`}
      </SizableText>
      {
              selectTags.includes(item.name) ? <CheckCircle color="gray" /> : <Circle color="gray" />
            }
    </View>
  )
})
