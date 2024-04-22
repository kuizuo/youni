import { Button, ButtonText, Input, InputField, Text, View } from '@gluestack-ui/themed'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import { NavBar, NavButton } from '@/ui/components/NavBar'
import { trpc } from '@/utils/trpc'
import { useAuth } from '@/utils/auth'

export function EditNameScreen() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const [name, setName] = useState('')

  useEffect(() => {
    setName(currentUser?.nickname || '')
  }, [])

  const { mutateAsync: updateProfile } = trpc.user.updateProfile.useMutation()

  const handleUpdateProfile = async () => {
    await updateProfile({
      nickname: name,
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
        <Text flex={1} textAlign="center">编辑名字</Text>
      </NavBar>

      <View flex={1} p="$2">
        <Input
          variant="outline"
          size="md"
          isDisabled={false}
          isInvalid={false}
          isReadOnly={false}
        >
          <InputField value={name} onChangeText={setName} />
        </Input>
        <View>
          <Text size="sm" color="$secondary400" mt="$1">
            {'请设置 2-24 个字符,不包括 @<>/ 等无效字符'}
          </Text>
        </View>
      </View>
    </View>
  )
}
