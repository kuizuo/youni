import { useEffect, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Form, Input, Spinner, TextArea, View, XStack, YStack } from '@/ui'
import { NavBar } from '@/ui/components/NavBar'
import { BackButton } from '@/ui/components/BackButton'

export function CreateScreen() {
  const { bottom } = useSafeAreaInsets()
  const [status, setStatus] = useState<'off' | 'submitting' | 'submitted'>('off')

  const handleSubmit = () => {

  }

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (status === 'submitting') {
      const timer = setTimeout(() => setStatus('off'), 2000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [status])

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    })

    if (!result.canceled)
      console.log(result)
    else
      alert('You did not select any image.')
  }

  return (
    <YStack flex={1} bg="$background">
      <NavBar left={<BackButton />}></NavBar>
      <Form
        flex={1}
        minWidth={300}
        gap="$2"
        onSubmit={handleSubmit}
        br="$4"
        px="$4"
      >

        <Input size="$2" placeholder="标题" onChangeText={text => setTitle(text)} unstyled />

        <TextArea size="$2" placeholder="添加正文" bbw={1} bbc="$borderColor" onChangeText={text => setContent(text)} unstyled />

        <View flex={1}>

        </View>
        <XStack>
          <Form.Trigger flex={1} asChild disabled={status !== 'off'} mb={bottom}>
            <Button icon={status === 'submitting' ? () => <Spinner /> : undefined}>
              发布笔记
            </Button>
          </Form.Trigger>
        </XStack>
      </Form>
    </YStack>
  )
}
