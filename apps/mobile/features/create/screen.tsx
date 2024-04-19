import { memo, useCallback, useEffect, useState } from 'react'
import { useActionSheet } from '@expo/react-native-action-sheet'
import * as ImagePicker from 'expo-image-picker'
import { PermissionStatus } from 'expo-image-picker'
import { AlertTriangle, ChevronRight, Hash, MapPin, Plus } from 'lucide-react-native'
import { KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useRouter } from 'expo-router'
import { useToken } from '@gluestack-style/react'
import {
  Button,
  ButtonText,
  Divider,
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  HStack,
  Icon,
  Image,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Switch,
  Text,
  Textarea,
  TextareaInput,
  Toast,
  ToastTitle,
  View,
  useToast,
} from '@gluestack-ui/themed'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TagSheet } from './components/TagSheet'
import { ListItem } from '@/ui/components/ListItem'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'
import { client } from '@/utils/http/client'
import { trpc } from '@/utils/trpc'
import { useTags } from '@/atoms/create'
import { useModal } from '@/ui/components/CustomModal'

const createNoteSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string(),
  tags: z.array(z.string({})).optional(),
  images: z.array(z.object({
    src: z.string(),
    uri: z.string().optional(),
    fileName: z.string().optional(),
    mimeType: z.string().optional(),
  }))
    .min(1, '至少需要上传一张图片')
    .max(9, '最多上传 9 张图片'),
  location: z.string().optional(),
  isAppendCampus: z.boolean().optional(),
})

type CreateNoteSchemaType = z.infer<typeof createNoteSchema>

export function CreateScreen() {
  const window = useWindowDimensions()
  const router = useRouter()
  const toast = useToast()

  const gap = useToken('space', '2')
  const padding = useToken('space', '4')
  const { showActionSheetWithOptions } = useActionSheet()
  const modal = useModal()

  const imageWidth = (window.width - (gap + padding) * 2) / 3

  const [selectTags, setSelectTags] = useTags()
  const [location, setLocation] = useState<string>('')
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    getValues,
    reset,
  } = useForm<CreateNoteSchemaType>({
    resolver: zodResolver(createNoteSchema),
  })

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: 'images',
  })

  // FIXME:
  useEffect(() => {
    return () => {
      setSelectTags([])
    }
  }, [])

  const { mutateAsync } = trpc.note.create.useMutation()

  const uploadImage = async (images: ImagePicker.ImagePickerAsset[]) => {
    const formData = new FormData()

    images.forEach((image, index) => {
      formData.append(`file${index}`, {
        type: image.mimeType,
        name: image.fileName,
        uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
      })
    })

    const data = await client.post('/api/files/upload/multiple?type=photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }) as { url: string, name: string }[]

    return data
  }

  const onSubmit = async (_data: CreateNoteSchemaType) => {
    const imagesData = await uploadImage(_data.images)

    setValue('images', imagesData.map((image, i) => ({
      src: image.url,
    })))

    // setValue('tags', selectTags)
    // setValue('location', location)

    try {
      const result = await mutateAsync({
        ..._data,
        tags: selectTags,
        images: getValues('images'),
        state: 'Audit',
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
      router.replace(`/note/${result.id}`)
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

  const pickImageAsync = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status === PermissionStatus.GRANTED) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // 只允许选择图片
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: 9 - imageFields.length,
        quality: 1,
      })

      if (!result.canceled) {
        // @ts-expect-error
        appendImage(result.assets.map(asset => ({
          src: asset.uri,
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.type,
          // width: asset?.width,
          // height: asset?.height,
        })))
      }
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
          removeImage(index)

          break
        case cancelButtonIndex:
        // Canceled
      }
    })
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
        minWidth={300}
        gap="$1"
        px={padding}
      >
        <FormControl
          isInvalid={(!!errors.images) && !!errors.images}
          isRequired={true}
        >
          <ScrollView
            horizontal
            maxHeight={imageWidth}
            showsHorizontalScrollIndicator={false}
            mx={-padding}
            px={padding}
            mb="$2"
          >
            <HStack alignItems="center" gap="$2">
              {imageFields?.map((field, index) => (
                <Pressable
                  key={field.id}
                  onPress={() => handlePressImage(index)}
                >
                  <Image
                    source={field.src}
                    width={imageWidth}
                    height={imageWidth}
                    bg="$backgroundDark300"
                    borderRadius="$xl"
                    justifyContent="center"
                    alignItems="center"
                    alt="image"
                  />
                </Pressable>
              ))}
              {
                imageFields.length < 9 && (
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
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} size="md" />
            <FormControlErrorText>
              {errors?.images?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl
          isInvalid={(!!errors.title) && !!errors.title}
          isRequired={true}
        >
          <Controller
            name="title"
            defaultValue=""
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await createNoteSchema.parseAsync({ title: value })
                  return true
                }
                catch (error: any) {
                  return error.message
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
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
                  fontSize="$sm"
                  type="text"
                  returnKeyType="done"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} size="md" />
            <FormControlErrorText>
              {errors?.title?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl>
          <Controller
            name="content"
            defaultValue=""
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea
                h="$40"
                borderWidth={0}
              >
                <TextareaInput
                  fontSize={14}
                  numberOfLines={10}
                  p="$0"
                  textAlign="left"
                  placeholder="添加正文"
                  verticalAlign="top"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </Textarea>
            )}
          />
        </FormControl>
      </View>

      <Divider />
      <View flex={1}>
        <FormControl>
          <Controller
            name="isAppendCampus"
            defaultValue={false}
            control={control}
            render={({ field: { onChange, value } }) => (
              <HStack px="$4" gap="$2" alignItems="center">
                <Text size="sm">发布到本校区</Text>
                <Switch size="sm" isChecked={value} onChange={onChange} />
              </HStack>
            )}
          />
        </FormControl>

        <ListItem
          title="添加话题"
          icon={Hash}
          right={<Icon as={ChevronRight} size="md" />}
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
          right={<Icon as={ChevronRight} size="md" />}
          onPress={() => router.push('/create/map')}
        />
      </View>

      <TagSheet ref={modal.ref} />
    </View>
  )
}
