import { Stack, useRouter } from 'expo-router'
import { NavButton } from '@/ui/components/NavButton'

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: '创作中心',
          headerLeft: () => <NavButton.Back />,
        }}
      />
    </Stack>
  )
}
