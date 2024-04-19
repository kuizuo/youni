import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { Button, ButtonText, Divider, Icon, ScrollView, View } from '@gluestack-ui/themed'
import { useAuth } from '@/utils/auth'
import { trpc } from '@/utils/trpc'
import { ListItem } from '@/ui/components/ListItem'
import { ListGroup } from '@/ui/components/ListGroup'

export function SettingScreen() {
  const router = useRouter()
  const { bottom } = useSafeAreaInsets()
  const { isLogged } = useAuth()

  const renderItem = ({ item }: { item: string }) => (
    <></>
  )

  return (
    <View
      flex={1}
      bg="$backgroundLight0"
      $dark-bg="$backgroundDark950"
    >
      <ScrollView
        bg="$backgroundLight200"
      >

        <ListGroup mt="$4" bg="$backgroundLight0" divider={<Divider />}>
          <ListItem
            title="账号与安全"
            right={<Icon as={ChevronRight} size="md" />}
            onPress={() => router.push('/setting/account')}
          />
          <ListItem
            title="深色模式"
            right={<Icon as={ChevronRight} size="md" />}
            onPress={() => router.push('/setting/dark-mode')}
          />
        </ListGroup>

        <ListGroup mt="$4" bg="$backgroundLight0" divider={<Divider />}>
          <ListItem title="通用设置" right={<Icon as={ChevronRight} size="md" />} onPress={() => router.push('/setting/general')} />
          <ListItem title="通知设置" right={<Icon as={ChevronRight} size="md" />} />
        </ListGroup>

        <ListGroup mt="$4" bg="$backgroundLight0" divider={<Divider />}>
          <ListItem title="用户协议" right={<Icon as={ChevronRight} size="md" />} />
          <ListItem title="隐私政策" right={<Icon as={ChevronRight} size="md" />} />
          <ListItem title="个人信息收集清单" right={<Icon as={ChevronRight} size="md" />} />
          <ListItem title="第三方信息共享清单" right={<Icon as={ChevronRight} size="md" />} />
        </ListGroup>

        <ListGroup mt="$4" bg="$backgroundLight0">
          {isLogged
            ? (
              <LogOutItem />
              )
            : (
              <Button
                onPress={() => {
                  router.replace('/login')
                }}
                size="lg"
              >
                <ButtonText>登录</ButtonText>
              </Button>
              )}
        </ListGroup>
      </ScrollView>
    </View>
  )
}

function LogOutItem() {
  const { logout } = useAuth()

  const { isLoading, mutateAsync } = trpc.auth.logout.useMutation()

  async function handleLogout() {
    try {
      if (isLoading)
        return
      await mutateAsync()
    }
    catch (error) {
      // empty
    }
    finally {
      logout()
    }
  }

  return (
    <Button onPress={handleLogout} bg="$backgroundLight0">
      <ButtonText color="$textColor0">退出登录</ButtonText>
    </Button>
  )
}
