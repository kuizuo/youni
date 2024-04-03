import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useActionSheet } from '@expo/react-native-action-sheet'
import * as ImagePicker from 'expo-image-picker'
import { PermissionStatus } from 'expo-image-picker'
import { CheckCircle, ChevronRight, Circle, Hash, MapPin, Plus, Search } from '@tamagui/lucide-icons'
import { ActivityIndicator, Platform, useWindowDimensions } from 'react-native'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useRouter } from 'expo-router'
import { atom, useAtom, useSetAtom } from 'jotai'
import type { ListRenderItem } from '@shopify/flash-list'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NoteTag } from '@youni/database'
import { Button, Image, Input, ListItem, ScrollView, Separator, Sheet, SizableText, TextArea, View, XStack, YStack, getTokens, useToastController } from '@/ui'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'
import FormControl from '@/ui/components/FormControl'
import { client } from '@/utils/http/client'
import { trpc } from '@/utils/trpc'
import { EmptyResult } from '@/ui/components/EmptyResult'

interface IFormInput {
  title: string
  content: string
  tags: string[]
  images: { src: string, width?: number, height?: number }[]
  location: string
}

const tagSheetOpenAtom = atom(false)
const selectTagsAtom = atom<string[]>([])

export function CreateScreen() {
  const window = useWindowDimensions()
  const router = useRouter()
  const toast = useToastController()
  const { showActionSheetWithOptions } = useActionSheet()

  const gap = getTokens().space.$2
  const padding = getTokens().space.$4

  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([])
  const imageLength = useMemo(() => photos.length, [photos])
  const imageWidth = (window.width - (gap.val + padding.val) * 2) / 3

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<IFormInput>()

  const setTagSheetOpen = useSetAtom(tagSheetOpenAtom)
  const [selectTags, setSelectTags] = useAtom(selectTagsAtom)

  const [location, setLocation] = useState<string>('')

  const { mutateAsync } = trpc.note.create.useMutation()

  useEffect(() => {
    return () => {
      setSelectTags([])
    }
  }, [])

  const uploadImage = async (images: ImagePicker.ImagePickerAsset[]) => {
    const formData = new FormData()

    images.forEach((image, index) => {
      // @ts-expect-error
      formData.append(`file${index}`, {
        type: image.mimeType,
        name: image.fileName,
        uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
      })
    })

    const { data } = await client.post('/api/files/upload/multiple?type=photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return data as { url: string, name: string }[]
  }

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const imagesData = await uploadImage(photos)

    setValue('tags', selectTags)
    // setValue('location', location)
    setValue('images', imagesData.map((image, i) => ({
      src: image.url,
      width: photos[i]?.width,
      height: photos[i]?.height,
    })))

    const result = await mutateAsync({
      ...data,
    })

    toast.show('发布成功')
    router.push(`/note/${result.id}`)
  }

  function ImageViewer() {
    const pickImageAsync = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status === PermissionStatus.GRANTED) {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images, // 只允许选择图片
          allowsEditing: false,
          allowsMultipleSelection: true,
          selectionLimit: 9 - imageLength,
          quality: 1,
        })

        if (!result.canceled)
          setPhotos(prev => [...prev, ...result.assets])
      }
      else {
        toast.show('需要授权相册才可发布图文')
      }
    }

    const handlePressImage = (index: number) => {
      const options = ['删除', '取消']

      const destructiveButtonIndex = options.indexOf('删除')
      const cancelButtonIndex = options.indexOf('取消')

      showActionSheetWithOptions({
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      }, async (selectedIndex) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:
            // eslint-disable-next-line no-case-declarations
            const newPhotos = [...photos]
            newPhotos.splice(index, 1)
            setPhotos(newPhotos)

            break
          case cancelButtonIndex:
          // Canceled
        }
      })
    }

    return (
      <ScrollView
        horizontal
        maxHeight={imageWidth}
        showsHorizontalScrollIndicator={false}
        mx={-padding.val}
        px={padding.val}
        mb="$2"
      >
        <XStack ai="center" gap="$2">
          {photos?.map((asset, index) => (
            <Image source={asset} key={asset.assetId} br="$4" width={imageWidth} height={imageWidth} bg="$color2" jc="center" ai="center" onPress={() => handlePressImage(index)} />
          ))}

          {
          imageLength < 9 && (
            <View br="$4" width={imageWidth} height={imageWidth} bg="$color2" jc="center" ai="center" onPress={pickImageAsync}>
              <Plus color="$color11" />
            </View>
          )
        }
        </XStack>
      </ScrollView>
    )
  }

  return (
    <YStack flex={1} bg="$background">
      <NavBar
        left={<NavButton.Back />}
        right={(
          <Button size="$2" onPress={handleSubmit(onSubmit)}>
            发布
          </Button>
        )}
      />

      <View
        flex={1}
        minWidth={300}
        gap="$2"
        px={padding}
      >

        <ImageViewer></ImageViewer>

        <FormControl
          control={control}
          name="title"
          rules={{ required: true }}
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              size="$2"
              fontSize={16}
              bbw={1}
              bbc="$borderColor"
              placeholder="标题"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              unstyled
            />
          )}
        />

        <FormControl
          control={control}
          name="content"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextArea
              height={150}
              mb="$4"
              multiline
              numberOfLines={4}
              placeholder="添加正文"
              textAlign="left"
              textAlignVertical="top"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              unstyled
            />
          )}
        />
      </View>

      <Separator mx={padding} />
      <View flex={1}>
        <ListItem hoverTheme pressTheme icon={Hash} iconAfter={ChevronRight} onPress={() => setTagSheetOpen(true)}>添加话题</ListItem>
        {selectTags && (
          <>
            <XStack columnGap="$2" mx={padding.val} flexWrap="wrap">
              {selectTags.map(name => (
                <SizableText key={name} color="$blue8" onPress={() => setSelectTags(prev => prev.filter(t => t !== name))}>
                  {`#${name}`}
                </SizableText>
              ))}
            </XStack>
          </>
        )}
        <ListItem hoverTheme pressTheme icon={MapPin} iconAfter={ChevronRight} onPress={() => router.push('/create/map')}>{location || '我的位置'}</ListItem>
      </View>

      <TagSheet />
    </YStack>
  )
}

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
      <SizableText flex={1} fontSize={16}>
        {`# ${item.name}`}
      </SizableText>
      {
              selectTags.includes(item.name) ? <CheckCircle color="gray" /> : <Circle color="gray" />
            }
    </View>
  )
})

const TagSheet = memo(() => {
  const [open, setOpen] = useAtom(tagSheetOpenAtom)

  const [searchText, setSearchText] = useState<string>('')
  const [isSearching, setIsSearching] = useState(false)

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
    () => data.pages.map(page => page.items).flat(),
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
            autoFocus
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
