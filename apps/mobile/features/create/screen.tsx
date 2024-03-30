import { useEffect, useMemo, useState } from 'react'
import { useActionSheet } from '@expo/react-native-action-sheet'
import * as ImagePicker from 'expo-image-picker'
import { ChevronRight, Hash, MapPin, Plus } from '@tamagui/lucide-icons'
import { useWindowDimensions } from 'react-native'
import { Button, Form, Image, Input, ListItem, Spinner, Text, TextArea, View, XStack, YStack, getTokens } from '@/ui'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'

const gap = getTokens().space.$2
const padding = getTokens().space.$4

export function CreateScreen() {
  const [status, setStatus] = useState<'off' | 'submitting' | 'submitted'>('off')

  const window = useWindowDimensions()
  const { showActionSheetWithOptions } = useActionSheet()

  const imageWidth = (window.width - (gap.val + padding.val) * 2) / 3

  const handleSubmit = () => {

  }

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [location, setLocation] = useState<string>('')

  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([])
  const imageLength = useMemo(() => images.length, [images])

  useEffect(() => {
    if (status === 'submitting') {
      const timer = setTimeout(() => setStatus('off'), 2000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [status])

  function ImageViewer() {
    const pickImageAsync = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // 只允许选择图片
        allowsEditing: true,
        quality: 1,
        allowsMultipleSelection: true,
      })

      if (!result.canceled)
        setImages(prev => [...prev, ...result.assets])
    }

    const handlePressImage = (index: number) => {
      console.log(index)

      const options = ['删除', '取消']

      const destructiveButtonIndex = options.indexOf('隐藏')
      const cancelButtonIndex = options.indexOf('取消')

      showActionSheetWithOptions({
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      }, async (selectedIndex) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:

            // Toast.show({
            //   type: 'success',
            //   text1: '隐藏成功',
            // })

            break
          case cancelButtonIndex:
          // Canceled
        }
      })
    }

    return (
      <View flexDirection="row" flexWrap="wrap" gap={gap}>
        {images?.map(image => (
          <Image source={image} key={image.assetId} br="$4" width={imageWidth} height={imageWidth} bg="$color2" jc="center" ai="center" onPress={handlePressImage} />
        ))}

        {
          imageLength < 9 && (
            <View br="$4" width={imageWidth} height={imageWidth} bg="$color2" jc="center" ai="center" onPress={pickImageAsync}>
              <Plus color="$color11" />
            </View>
          )
        }
      </View>
    )
  }

  return (
    <YStack flex={1} bg="$background">
      <NavBar
        left={<NavButton.Back />}
        right={(
          <Button size="$2" icon={status === 'submitting' ? () => <Spinner /> : undefined}>
            发布
          </Button>
        )}
      />

      <Form
        flex={1}
        minWidth={300}
        gap="$2"
        onSubmit={handleSubmit}
        px={padding}
      >

        <ImageViewer></ImageViewer>

        <Input size="$2" fontSize={16} bbw={1} bbc="$borderColor" placeholder="标题" onChangeText={text => setTitle(text)} unstyled />

        <TextArea
          multiline
          numberOfLines={4}
          placeholder="添加正文"
          textAlign="left"
          textAlignVertical="top"
          onChangeText={text => setContent(text)}
          unstyled
        />
      </Form>
      <View flex={1}>
        <ListItem hoverTheme pressTheme icon={Hash}iconAfter={ChevronRight}>添加话题</ListItem>
        <ListItem hoverTheme pressTheme icon={MapPin} iconAfter={ChevronRight}>我的位置</ListItem>
      </View>

    </YStack>
  )
}
