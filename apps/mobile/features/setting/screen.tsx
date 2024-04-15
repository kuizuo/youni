import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { Button, ListItem, ScrollView, Separator, SizableText, Text, View, YGroup } from '@/ui'
import { useUser } from '@/utils/auth/hooks/useUser'
import { trpc } from '@/utils/trpc'
import { removeToken } from '@/utils/auth/util'
import { useAuth } from '@/utils/auth/hooks/useAuth'

export function SettingScreen() {
  const router = useRouter()
  const { bottom } = useSafeAreaInsets()
  const { isSignined } = useUser()

  const renderItem = ({ item }: { item: string }) => (
    <YGroup.Item>
      <ListItem
        pressTheme
        hoverTheme
        title="账号与安全"
        iconAfter={ChevronRight}
        onPress={() => router.push('/setting/account')}
      />
    </YGroup.Item>
  )

  return (
    <View flex={1} bg="$background">
      <ScrollView bg="$gray2">
        <YGroup alignSelf="center" size="$4" br={0} mt="$4" separator={<Separator />} unstyled>
          <YGroup.Item>
            <ListItem
              pressTheme
              hoverTheme
              title="账号与安全"
              iconAfter={ChevronRight}
              onPress={() => router.push('/setting/account')}
            />
          </YGroup.Item>
          <YGroup.Item>
            <ListItem
              pressTheme
              hoverTheme
              title="深色模式"
              iconAfter={ChevronRight}
              onPress={() => router.push('/setting/dark-mode')}
            />
          </YGroup.Item>
        </YGroup>

        <YGroup alignSelf="center" size="$4" br={0} mt="$4" separator={<Separator />}>
          <YGroup.Item>
            <ListItem pressTheme hoverTheme title="通用设置" iconAfter={ChevronRight}onPress={() => router.push('/setting/general')} />
          </YGroup.Item>
          <YGroup.Item>
            <ListItem pressTheme hoverTheme title="通知设置"iconAfter={ChevronRight} />
          </YGroup.Item>
        </YGroup>

        <YGroup alignSelf="center" size="$4" br={0} mt="$4" separator={<Separator />}>
          <YGroup.Item>
            <ListItem pressTheme hoverTheme title="用户协议" iconAfter={ChevronRight} />
          </YGroup.Item>
          <YGroup.Item>
            <ListItem pressTheme hoverTheme title="隐私政策" iconAfter={ChevronRight} />
          </YGroup.Item>
          <YGroup.Item>
            <ListItem pressTheme hoverTheme title="个人信息收集清单" iconAfter={ChevronRight} />
          </YGroup.Item>
          <YGroup.Item>
            <ListItem pressTheme hoverTheme title="第三方信息共享清单" iconAfter={ChevronRight} />
          </YGroup.Item>
        </YGroup>

        <View mt="$4" pb={bottom}>
          {isSignined
            ? (
              <LogOutItem />
              )
            : (
              <Button
                onPress={() => {
                  router.replace('/login')
                }}
                br={0}
                size="large"
              >
                登录
              </Button>
              )}
        </View>
      </ScrollView>

    </View>
  )
}

function LogOutItem() {
  const { signOut } = useAuth()

  const { isLoading, mutateAsync } = trpc.auth.logout.useMutation()

  async function logout() {
    try {
      if (isLoading)
        return
      await mutateAsync()
    }
    catch (error) {
      // empty
    }
    finally {
      signOut()
    }
  }

  return (
    <Button onPress={logout} br={0} backgroundColor="$background">
      退出登录
    </Button>
  )
}
