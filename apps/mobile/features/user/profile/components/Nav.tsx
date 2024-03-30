import { Highlighter, History, LifeBuoy } from '@tamagui/lucide-icons'
import type { IconProps } from '@tamagui/helpers-icon'
import type { Href } from 'expo-router'
import { Link } from 'expo-router'
import { BlurView } from 'expo-blur'
import { Text, XStack, useTheme } from '@/ui'

export function Navs() {
  const theme = useTheme()

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
    <XStack gap="$2.5" mx="$4" marginBottom="$3">
      {
      navItems.map(({ href, icon, text, desc }) => {
        return (
          <BlurView
            key={href}
            intensity={60}
            style={{
              flex: 1,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.$borderColor?.get(),
              overflow: 'hidden',
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Link href={href} asChild>
              <XStack gap="$1.5" ai="center">
                {icon}
                <Text fontSize="$2">
                  {text}
                </Text>
              </XStack>
            </Link>
            <Text fontSize={10}>
              {desc}
            </Text>
          </BlurView>
        )
      })
    }
    </XStack>
  )
}
