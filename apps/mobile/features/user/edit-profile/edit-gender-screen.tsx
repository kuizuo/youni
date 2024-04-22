import {
  Box,
  Button,
  ButtonText,
  Divider,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Icon,
  Pressable,
  Text,
  View,
} from '@gluestack-ui/themed'
import { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import { Check } from 'lucide-react-native'
import { NavBar, NavButton } from '@/ui/components/NavBar'
import { trpc } from '@/utils/trpc'
import { useAuth } from '@/utils/auth'

export function EditGenderScreen() {
  const router = useRouter()
  const { gender: g } = useLocalSearchParams<{ gender: string }>()

  const [gender, setGender] = useState<0 | 1 | 2>(Number(g) || 0)

  const { mutateAsync: updateProfile } = trpc.user.updateProfile.useMutation()

  const handleUpdateProfile = async () => {
    await updateProfile({
      gender,
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
        <Text flex={1} textAlign="center">编辑性别</Text>
      </NavBar>

      <View flex={1} p="$2">
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText>请选择你的性别</FormControlLabelText>
          </FormControlLabel>
          <Box mt="$2" borderRadius="$xl" bg="$trueGray800">
            <Pressable onPress={() => setGender(1)}>
              <HStack p="$3" justifyContent="space-between">
                <Text>男</Text>
                {gender === 1 && <Icon as={Check} />}
              </HStack>
            </Pressable>
            <Divider></Divider>
            <Pressable onPress={() => setGender(2)}>
              <HStack p="$3" justifyContent="space-between">
                <Text>女</Text>
                {gender === 2 && <Icon as={Check} />}
              </HStack>
            </Pressable>
          </Box>
        </FormControl>
      </View>
    </View>
  )
}
