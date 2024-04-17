import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { BadgeHelp, Highlighter, History, Settings } from 'lucide-react-native'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Divider, HStack, Icon, Pressable, Text, VStack, useToken } from '@gluestack-ui/themed'
import { useColorScheme } from 'nativewind'
import { useDrawerOpen } from '@/atoms/drawer'

export default function CustomDrawerContent() {
  const router = useRouter()

  const { colorScheme } = useColorScheme()
  const textColor = useToken('colors', colorScheme === 'dark' ? 'textDark700' : 'textLight700')
  const bgColor = useToken('colors', colorScheme === 'dark' ? 'backgroundLight950' : 'backgroundLight0')

  const { bottom } = useSafeAreaInsets()
  const [open, setOpen] = useDrawerOpen()

  const drawerItems: React.ComponentProps<typeof DrawerItem>[] = [
    {
      label: '创作中心',
      icon: () => <Icon as={Highlighter} size="md" color={textColor} />,
      onPress: () => handlePressItem(() => router.push('/(creator)/')),
    },
    {
      label: '浏览记录',
      icon: () => <Icon as={History} size="md" color={textColor} />,
      onPress: () => handlePressItem(() => router.push('/history/')),
    },
  ]

  const bottomNav: { label: string, icon: JSX.Element, onPress: () => void }[] = [
    {
      label: '设置',
      icon: <Icon as={Settings} size="md" color={textColor} />,
      onPress: () => handlePressItem(() => router.push('/setting/')),
    },
    {
      label: '帮助与反馈',
      icon: <Icon as={BadgeHelp} size="md" color={textColor} />,
      onPress: () => { },
    },
    // { label: '扫一扫', onPress: ()=>{}},
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
      style={{ backgroundColor: bgColor }}
    >
      {/* <DrawerItemList {...props} /> */}

      <VStack flex={1} mx="$2">

        {drawerItems.map(({ label, icon, onPress }) => (
          <DrawerItem
            key={label as string}
            icon={icon}
            label={label}
            onPress={onPress}
          />
        ))}

        <Divider my={15} />

        <DrawerItem
          label="子项 1"
          onPress={() => { }}
        />
        <DrawerItem
          label="子项 2"
          onPress={() => { }}
        />

        <HStack
          position="absolute"
          bottom={bottom}
          flex={1}
          mx="$4"
          gap="$4"
        >
          {bottomNav.map(({ label, icon, onPress }) => (
            <Pressable
              key={label}
              flex={1}
              justifyContent="center"
              alignItems="center"
              gap="$1.5"
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
                {icon}
              </BlurView>
              <Text flex={1} textAlign="center" size="sm">
                {label}
              </Text>
            </Pressable>
          ))}
        </HStack>
      </VStack>
    </DrawerContentScrollView>
  )
}
