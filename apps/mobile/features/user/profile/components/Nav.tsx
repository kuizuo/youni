import { Highlighter, History, LifeBuoy } from 'lucide-react-native'
import type { LucideProps } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { BlurView } from 'expo-blur'
import { Icon, Pressable, Text, View, useToken } from '@gluestack-ui/themed'
import { useColorScheme } from 'react-native'

export function Navs() {
  interface Item {
    icon: React.ReactElement<LucideProps>
    text: string
    desc: string
    onPress: () => void
  }

  const router = useRouter()

  const colorScheme = useColorScheme()
  const borderColor = useToken('colors', colorScheme === 'dark' ? 'borderDark300' : 'backgroundLight300')
  const textColor = useToken('colors', colorScheme === 'dark' ? 'textDark700' : 'textLight700')

  const navItems: Item[] = [
    {
      onPress: () => router.push('/campus'),
      icon: <Icon as={LifeBuoy} size="md" color={textColor} />,
      text: '我的校园',
      desc: '校园动态',
    },
    {
      onPress: () => router.push('/(creator)'),
      icon: <Icon as={Highlighter} size="md" color={textColor} />,
      text: '创作中心',
      desc: '创造你的世界',
    },
    {
      onPress: () => router.push('/history/'),
      icon: <Icon as={History} size="md" color={textColor} />,
      text: '浏览记录',
      desc: '看过的笔记',
    },
  ]

  return (
    <View className="flex-row mx-4 mb-3 gap-3">
      {
        navItems.map(({ text, icon, desc, onPress }) => {
          return (
            <BlurView
              key={text}
              className="flex-1 rounded-md overflow-hidden px-3 py-2"
              style={{
                borderWidth: 1,
                borderColor,
              }}
            >
              <Pressable onPress={onPress}>
                <View
                  className="flex-row items-center gap-1"
                >
                  {icon}
                  <Text size="sm">
                    {text}
                  </Text>
                </View>
                <Text size="xs" color="$secondary500">
                  {desc}
                </Text>
              </Pressable>

            </BlurView>
          )
        })
      }
    </View>
  )
}
