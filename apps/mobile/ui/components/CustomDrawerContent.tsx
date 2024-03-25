import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { History, Settings } from '@tamagui/lucide-icons'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'

import { Button, Separator, SizableText, XStack, YStack, useTheme } from '..'

export default function CustomDrawerContent() {
  const router = useRouter()
  const theme = useTheme()

  return (
    <DrawerContentScrollView
      style={{
        backgroundColor: theme.backgroundColor?.get(),
      }}
    >
      {/* <DrawerItemList {...props} /> */}
      {/* <DrawerItem label={"退出登录"} onPress={() => {}} /> */}

      <YStack flex={1} mx="$2">
        <DrawerItem
          icon={() => <History />}
          label="浏览记录"
          onPress={() => router.push('/history/')}
        />
        <Separator my={15} />

        <XStack
          flex={1}
          alignContent="flex-end"
          mx="$4"
          gap="$4"
        >
          <YStack
            jc="center"
            ai="center"
            gap="$1"
            onPress={() => router.push('/setting/')}
          >
            <BlurView
              intensity={70}
              style={{
                justifyContent: 'center',
                borderRadius: 50,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#f1f5f9',
                paddingHorizontal: 6,
                paddingVertical: 4,
              }}
            >
              <Button icon={<Settings size="$1.5" />} unstyled />
            </BlurView>
            <SizableText fontSize={10} flex={1} textAlign="center">
              设置
            </SizableText>
          </YStack>
        </XStack>
      </YStack>
    </DrawerContentScrollView>
  )
}
