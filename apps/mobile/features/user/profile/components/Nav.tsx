import { Highlighter, History, LifeBuoy } from '@tamagui/lucide-icons'
import type { IconProps } from '@tamagui/helpers-icon'
import type { Href } from 'expo-router'
import { Link } from 'expo-router'
import { BlurView } from 'expo-blur'
import { Text, View, useTheme } from '@/ui'
import tw from '@/utils/tw'

export function Navs() {
  interface Item {
    href: Href<string>
    icon: React.ReactElement<IconProps>
    text: string
    desc: string
  }

  const navItems: Item[] = [
    {
      href: '/campus',
      icon: <LifeBuoy size={16} />,
      text: '我的校园',
      desc: '校园动态',
    },
    {
      href: '/(creator)',
      icon: <Highlighter size={16} />,
      text: '创作中心',
      desc: '创造属于你的世界',
    },
    {
      href: '/history/',
      icon: <History size={16} />,
      text: '浏览记录',
      desc: '看过的笔记',
    },
  ]

  return (
    <View style={tw`flex-row mx-4 mb-3 gap-2.5`}>
      {
        navItems.map(({ href, icon, text, desc }) => {
          return (
            <BlurView
              key={href}
              intensity={60}
              style={tw`flex-1 rounded-md b-1 b-gray overflow-hidden px-3 py-2`}
            >
              <Link href={href} asChild>
                <View style={tw`flex-row items-center mb-3 gap-1`}>
                  {icon}
                  <Text fontSize="$2">
                    {text}
                  </Text>
                </View>
              </Link>
              <Text fontSize={10}>
                {desc}
              </Text>
            </BlurView>
          )
        })
      }
    </View>
  )
}
