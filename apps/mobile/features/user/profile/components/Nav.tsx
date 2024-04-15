import { Highlighter, History, LifeBuoy } from 'lucide-react-native'
import type { LucideProps } from 'lucide-react-native'
import type { Href } from 'expo-router'
import { Link } from 'expo-router'
import { BlurView } from 'expo-blur'
import { Text, View, useToken } from '@gluestack-ui/themed'
import { MyView } from '@/ui'

export function Navs() {
  interface Item {
    href: Href<string>
    icon: React.ReactElement<LucideProps>
    text: string
    desc: string
  }

  const textColor = useToken('colors', 'textLight300')
  const navItems: Item[] = [
    {
      href: '/campus',
      icon: <LifeBuoy size={16} color={textColor} />,
      text: '我的校园',
      desc: '校园动态',
    },
    {
      href: '/(creator)',
      icon: <Highlighter size={16} color={textColor} />,
      text: '创作中心',
      desc: '创造属于你的世界',
    },
    {
      href: '/history/',
      icon: <History size={16} color={textColor} />,
      text: '浏览记录',
      desc: '看过的笔记',
    },
  ]

  return (
    <MyView className="flex-row mx-4 mb-3 gap-2.5">
      {
        navItems.map(({ href, icon, text, desc }) => {
          return (
            <BlurView
              key={href}
              intensity={60}
              className="flex-1 rounded-md b-1 b-gray overflow-hidden px-3 py-2"
            >
              <Link href={href} asChild>
                <View className="flex-row items-center mb-3 gap-1">
                  {icon}
                  <Text size="sm">
                    {text}
                  </Text>
                </View>
              </Link>
              <Text size="xs">
                {desc}
              </Text>
            </BlurView>
          )
        })
      }
    </MyView>
  )
}
