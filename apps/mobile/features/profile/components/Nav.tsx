import { History } from "@tamagui/lucide-icons"
import type { IconProps } from '@tamagui/helpers-icon'
import { Href, Link } from "expo-router"
import { BlurView } from 'expo-blur';
import { XStack, Text } from "@/ui";

export const Navs = () => {
  type Item = {
    href: Href<string>,
    icon: React.ReactElement<IconProps>,
    text: string,
    desc: string,
  }

  const navItems: Item[] = [
    {
      href: '/history/',
      icon: <History size={16} />,
      text: '浏览记录',
      desc: '看过的笔记'
    }, {
      href: '/history/',
      icon: <History size={16} />,
      text: '浏览记录',
      desc: '看过的笔记'
    }, {
      href: '/history/',
      icon: <History size={16} />,
      text: '浏览记录',
      desc: '看过的笔记'
    }
  ]

  return <XStack gap='$4' padding='$4'>
    {
      navItems.map(({ href, icon, text, desc }) => {
        return <Link href={href} asChild>
          <BlurView intensity={90} style={{
            flex: 1,
            borderRadius: 8,
            overflow: "hidden",
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}>
            <XStack gap='$1.5' alignItems="center">
              {icon}
              <Text fontSize='$2'>
                {text}
              </Text>
            </XStack>
            <Text fontSize={10}>
              {desc}
            </Text>
          </BlurView>
        </Link>
      })
    }
  </XStack >
}
