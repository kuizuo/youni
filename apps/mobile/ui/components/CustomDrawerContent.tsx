import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { BadgeHelp, History, Settings } from '@tamagui/lucide-icons'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Separator, SizableText, View, XStack, YStack, useTheme, useWindowDimensions } from '..'
import { useDrawerOpen } from '@/atoms/drawer'

export default function CustomDrawerContent() {
  const router = useRouter()
  const theme = useTheme()
  const { bottom } = useSafeAreaInsets()
  const [open, setOpen] = useDrawerOpen()

  const bottomNav: { name: string, icon: JSX.Element, onPress: () => void }[] = [
    {
      name: '设置',
      icon: <Settings size="$1.5" />,
      onPress: () => handlePressItem(() => router.push('/setting/')),
    },
    {
      name: '帮助与反馈',
      icon: <BadgeHelp size="$1.5" />,
      onPress: () => {},
    },
    // { name: '扫一扫', onPress: ()=>{}},
  ]

  const handlePressItem = (callback: () => void) => {
    setOpen(false)
    callback()
  }

  return (
    <DrawerContentScrollView
      scrollEnabled={false}
      contentContainerStyle={{
        flexGrow: 1,
      }}
      style={{
        backgroundColor: theme.backgroundColor?.get(),
      }}
    >
      {/* <DrawerItemList {...props} /> */}

      <YStack flex={1} mx="$2">
        <DrawerItem
          icon={() => <History />}
          label="浏览记录"
          onPress={() => handlePressItem(() => router.push('/history/'))}
        />
        <DrawerItem
          label="子项 1"
          onPress={() => {}}
        />
        <DrawerItem
          label="子项 2"
          onPress={() => {}}
        />

        <Separator my={15} />

        <XStack
          position="absolute"
          bottom={bottom}
          flex={1}
          mx="$4"
          gap="$4"
        >
          {bottomNav.map(({ name, icon, onPress }) => (
            <YStack
              key={name}
              flex={1}
              jc="center"
              ai="center"
              gap="$1"
              onPress={onPress}
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
                <Button icon={icon} unstyled />
              </BlurView>
              <SizableText fontSize={10} flex={1} textAlign="center">
                {name}
              </SizableText>
            </YStack>
          ))}
        </XStack>
      </YStack>
    </DrawerContentScrollView>
  )
}
