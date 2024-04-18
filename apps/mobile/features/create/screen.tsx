import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useActionSheet } from '@expo/react-native-action-sheet'
import * as ImagePicker from 'expo-image-picker'
import { PermissionStatus } from 'expo-image-picker'
import { ChevronRight, Hash, MapPin, Plus } from 'lucide-react-native'
import { KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useRouter } from 'expo-router'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useToken } from '@gluestack-style/react'
import {
  Button,
  ButtonText,
  Divider,
  HStack,
  Icon,
  Image,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  Textarea,
  TextareaInput,
  Toast,
  ToastTitle,
  View,
  useToast,
} from '@gluestack-ui/themed'
import { TagSheet } from './components/TagSheet'
import { ListItem } from '@/ui/components/ListItem'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'
import FormControl from '@/ui/components/FormControl'
import { client } from '@/utils/http/client'
import { trpc } from '@/utils/trpc'
import { EmptyResult } from '@/ui/components/EmptyResult'
import { useTags } from '@/atoms/create'
import { useModal } from '@/ui/components/CustomModal'

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
  const toast = useToast()
  const { showActionSheetWithOptions } = useActionSheet()

  const gap = useToken('space', '2')
  const padding = useToken('space', '4')

  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([])
  const imageLength = useMemo(() => photos.length, [photos])
  const imageWidth = (window.width - (gap + padding) * 2) / 3

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<IFormInput>()

  const modal = useModal()

  const [selectTags, setSelectTags] = useTags()

  // FIXME:
  useEffect(() => {
    return () => {
      setSelectTags([])
    }
  }, [])

  const [location, setLocation] = useState<string>('')

  const { mutateAsync } = trpc.note.create.useMutation()

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

    try {
      const result = await mutateAsync({
        ...data,
      })

      toast.show({
        placement: 'top',
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="accent" action="success">
              <ToastTitle>发布成功</ToastTitle>
            </Toast>
          )
        },
      })
      router.push(`/note/${result.id}`)
    }
    catch (error) {
      toast.show({
        placement: 'top',
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="accent" action="error">
              <ToastTitle>{error.message}</ToastTitle>
            </Toast>
          )
        },
      })
    }
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
        toast.show({
          placement: 'bottom right',
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="warning">
                <ToastTitle>需要授权相册才可发布图文</ToastTitle>
              </Toast>
            )
          },
        })
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
        mx={-padding}
        px={padding}
        mb="$2"
      >
        <HStack alignItems="center" gap="$2">
          {photos?.map((asset, index) => (
            <Pressable
              key={asset.assetId}
              onPress={() => handlePressImage(index)}
            >
              <Image
                source={asset}
                width={imageWidth}
                height={imageWidth}
                className="rounded-xl"
                bg="$backgroundDark300"
                justifyContent="center"
                alignItems="center"
                alt="image"
              />
            </Pressable>
          ))}
          {
            imageLength < 9 && (
              <Pressable
                borderRadius="$xl"
                width={imageWidth}
                height={imageWidth}
                bg="$backgroundLight200"
                justifyContent="center"
                alignItems="center"
                onPress={pickImageAsync}
              >
                <Icon as={Plus} size="xl" color="$textLight400" />
              </Pressable>
            )
          }
        </HStack>
      </ScrollView>
    )
  }

  return (
    <View flex={1}>
      <NavBar
        left={<NavButton.Back />}
        right={(
          <Button size="xs" px="$2" py="$0.5" onPress={handleSubmit(onSubmit)}>
            <ButtonText>发布</ButtonText>
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
              variant="underlined"
              size="md"
              isDisabled={false}
              isInvalid={false}
              isReadOnly={false}
            >
              <InputField
                placeholder="标题"
                size="md"
                borderBottomWidth={1}
                borderBottomColor="$borderLight200"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            </Input>
          )}
        />

        <FormControl
          control={control}
          name="content"
          render={({ field: { value, onChange, onBlur } }) => (
            <Textarea
              height={300}
              borderWidth={0}
            >
              <TextareaInput
                fontSize={14}
                numberOfLines={4}
                p="$0"
                textAlign="left"
                placeholder="添加正文"
                textAlignVertical="top"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            </Textarea>
          )}
        />
      </View>

      <Divider mx={padding} />
      <View flex={1}>
        <ListItem
          title="添加话题"
          icon={Hash}
          iconAfter={ChevronRight}
          onPress={() => modal.present()}
        />
        {selectTags.length > 0 && (
          <>
            <HStack columnGap="$2" mx={padding} flexWrap="wrap">
              {selectTags.map(name => (
                <Text key={name} color="$blue500" onPress={() => setSelectTags(prev => prev.filter(t => t !== name))}>
                  {`#${name}`}
                </Text>
              ))}
            </HStack>
          </>
        )}
        <ListItem
          title={location || '我的位置'}
          icon={MapPin}
          iconAfter={ChevronRight}
          onPress={() => router.push('/create/map')}
        />
      </View>

      <TagSheet ref={modal.ref} />
    </View>
  )
}
