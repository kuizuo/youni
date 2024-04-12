import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useActionSheet } from '@expo/react-native-action-sheet'
import * as ImagePicker from 'expo-image-picker'
import { PermissionStatus } from 'expo-image-picker'
import { CheckCircle, ChevronRight, Circle, Hash, MapPin, Plus, Search } from '@tamagui/lucide-icons'
import { ActivityIndicator, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useRouter } from 'expo-router'
import { atom, useAtom, useSetAtom } from 'jotai'
import type { ListRenderItem } from '@shopify/flash-list'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NoteTag } from '@youni/database'
import { TagSheet } from './components/TagSheet'
import { Button, Image, Input, ListItem, ScrollView, Separator, Sheet, SizableText, TextArea, View, XStack, YStack, getTokens, useToastController } from '@/ui'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'
import FormControl from '@/ui/components/FormControl'
import { client } from '@/utils/http/client'
import { trpc } from '@/utils/trpc'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { selectTagsAtom, tagSheetOpenAtom } from '@/atoms/create'
import tw from '@/utils/tw'

interface IFormInput {
  title: string
  content: string
  tags: string[]
  images: { src: string, width?: number, height?: number }[]
  location: string
}

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

  const [tagSheetOpen, setTagSheetOpen] = useAtom(tagSheetOpenAtom)
  const [selectTags, setSelectTags] = useAtom(selectTagsAtom)

  const [location, setLocation] = useState<string>('')

  const { mutateAsync } = trpc.note.create.useMutation()

  useEffect(() => {
    return () => {
      setSelectTags([])
      setTagSheetOpen(false)
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
    <View style={tw`flex-1 bg-background`}>
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
        <KeyboardAvoidingView>
          <ImageViewer></ImageViewer>
        </KeyboardAvoidingView>

        <FormControl
          control={control}
          name="title"
          rules={{ required: true }}
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              size="$2"
              style={tw`text-base`}
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

      {tagSheetOpen && <TagSheet />}
    </View>
  )
}
