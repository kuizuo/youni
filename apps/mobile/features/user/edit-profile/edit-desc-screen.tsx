import { Button, ButtonText, Text, Textarea, TextareaInput, View } from '@gluestack-ui/themed'
import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import { NavBar, NavButton } from '@/ui/components/NavBar'
import { trpc } from '@/utils/trpc'

export function EditDescScreen() {
  const router = useRouter()
  const { text } = useLocalSearchParams<{ text: string }>()
  const [desc, setDesc] = useState(text || '')

  const { mutateAsync: updateProfile } = trpc.user.updateProfile.useMutation()

  const handleUpdateProfile = async () => {
    await updateProfile({
      desc,
    })

    Toast.show({
      type: 'success',
      text1: '更新成功',
    })

    router.back()
  }

  return (
    <View flex={1}>
      <NavBar
        left={<NavButton.Back />}
        right={(
          <Button variant="link" size="md" onPress={handleUpdateProfile}>
            <ButtonText>保存</ButtonText>
          </Button>
        )}
      >
        <Text flex={1} textAlign="center">编辑简介</Text>
      </NavBar>

      <View flex={1} p="$2">
        <Textarea
          size="md"
          isReadOnly={false}
          isInvalid={false}
          isDisabled={false}
        >
          <TextareaInput value={desc} onChangeText={setDesc} />
        </Textarea>
      </View>
    </View>
  )
}
