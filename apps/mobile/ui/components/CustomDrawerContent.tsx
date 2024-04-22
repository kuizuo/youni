import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { BadgeHelp, Highlighter, History, Settings } from 'lucide-react-native'
import { useRouter } from 'expo-router'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Box, Divider, HStack, Icon, Pressable, Text, VStack } from '@gluestack-ui/themed'
import { useDrawerOpen } from '@/atoms/drawer'
import { useColor } from '@/utils/theme'

export default function CustomDrawerContent() {
  const router = useRouter()

  const { textColor, bgColor, borderColor } = useColor()
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
          bottom={bottom || '$4'}
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
              <Box
                p="$2"
                borderWidth={1}
                borderColor={borderColor}
                borderRadius="$full"
              >
                {icon}
              </Box>
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
