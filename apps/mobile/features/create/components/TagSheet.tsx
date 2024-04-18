import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle, Circle, Search } from 'lucide-react-native'
import type { ListRenderItem } from '@shopify/flash-list'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NoteTag } from '@youni/database'
import {
  Button,
  ButtonText,
  Divider,
  Input,
  InputIcon,
  InputSlot,
  Pressable,
  Spinner,
  Text,
  View,
} from '@gluestack-ui/themed'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import type { BottomSheetModal } from '@gorhom/bottom-sheet'

import { trpc } from '@/utils/trpc'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { useTags } from '@/atoms/create'
import { CustomModal } from '@/ui/components/CustomModal'

interface Props { }

export const TagSheet = React.forwardRef<BottomSheetModal, Props>(
  (_, ref) => {
    const [searchText, setSearchText] = useState<string>('')

    const [selectTags, setSelectTags] = useTags()

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
        <TagItem item={item} setSelectTags={setSelectTags} />
      ),
      [data],
    )

    const handleAddTag = () => {
      setSelectTags(prev => [...prev, searchText])
      setSearchText('')
    }

    return (
      <CustomModal
        ref={ref}
        snapPoints={[260]}
      >
        <View flex={1} alignItems="center" p="$4">
          <Input width="$full" variant="rounded" size="sm" mb="$2">
            <InputSlot pl="$3">
              <InputIcon as={Search} />
            </InputSlot>
            <BottomSheetTextInput
              placeholder="搜索"
              onChangeText={(text) => {
                if (text !== searchText)
                  setSearchText(text.trim())
              }}
              verticalAlign="center"
              onSubmitEditing={() => handleSearch(searchText)}
              autoFocus={true}
              style={{ paddingHorizontal: 2 }}
            />
          </Input>

          <View flex={1} width="100%">
            <FlashList
              data={flatedData}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              onEndReached={() => {
                if (hasNextPage)
                  fetchNextPage()
              }}
              className="flex-1 w-full"
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
                  <Button onPress={handleAddTag}>
                    <ButtonText>添加该话题</ButtonText>
                  </Button>
                </>
              )}
            >
            </FlashList>
          </View>
        </View>
      </CustomModal>
    )
  },
)

function TagItem({
  item,
  setSelectTags,
}: {
  item: NoteTag
  setSelectTags: (prev: any) => void
}) {
  // FIXME: 无法触发组件渲染, 暂且将父组件方法传入
  const [selectTags, _setSelectTags] = useTags()

  const handleSelect = () => {
    if (selectTags.includes(item.name)) {
      setSelectTags(prev => prev.filter(tag => tag !== item.name))
      _setSelectTags(prev => prev.filter(tag => tag !== item.name))
    }
    else {
      setSelectTags(prev => [...prev, item.name])
      _setSelectTags(prev => [...prev, item.name])
    }
  }

  return (
    <Pressable onPress={handleSelect}>
      <View flexDirection="row" width="100%" justifyContent="space-between" py="$0.5">
        <Text flex={1} size="md">
          {`# ${item.name}`}
        </Text>
        {
          selectTags.includes(item.name) ? <CheckCircle color="gray" /> : <Circle color="gray" />
        }
      </View>
    </Pressable>
  )
}
