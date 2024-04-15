import { Stack, useRouter } from 'expo-router'
import { NavButton } from '@/ui/components/NavButton'

export default function Layout() {
  const router = useRouter()
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: '设置',
          headerLeft: () => <NavButton.Back />,
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          title: '账号与安全',
          headerLeft: () => <NavButton.Back />,
        }}
      />
      <Stack.Screen
        name="general"
        options={{
          title: '通用设置',
          headerLeft: () => <NavButton.Back />,
        }}
      />
      <Stack.Screen
        name="dark-mode"
        options={{
          title: '暗色模式',
          headerLeft: () => <NavButton.Back />,
        }}
      />
    </Stack>
  )
}
