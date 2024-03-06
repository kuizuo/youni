import { useUser } from "@/utils/auth/hooks/useUser"
import { Avatar, XStack, YStack, View, Text, SizableText, Paragraph, Image, Button, Theme, ScrollView } from "@/ui"
import React from "react"

import { History, Settings } from "@tamagui/lucide-icons"
import type { IconProps } from '@tamagui/helpers-icon'
import { Href, Link } from "expo-router"
import { BlurView } from 'expo-blur';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ProfileScreen = () => {
  const { top } = useSafeAreaInsets()

  const { profile } = useUser()

  if (!profile) {
    return <></>
  }

  return <YStack flex={1}>
    <ScrollView>
      <Theme name="dark">
        <YStack position="relative">
          <View marginBottom={top}></View>

          <Image
            source={require('@/assets/images/profile-background.png')}
            style={{ position: 'absolute', height: '100%' }}
          />
          <XStack gap='$4' padding='$4'>
            <Avatar circular size="$8">
              <Avatar.Image
                width="100%"
                height="100%"
                source={require('@/assets/images/avatar.png')}
              />
              <Avatar.Fallback />
            </Avatar>
            <YStack flex={1} >
              <XStack gap="$2" alignItems='center'>
                <SizableText size={16}>
                  {profile.nickname}
                </SizableText>
                <Image
                  source={profile.gender === 1 ? require('@/assets/icons/male.png') : require('@/assets/icons/female.png')}
                  width={20}
                  height={20}
                />
              </XStack>

              <SizableText size={'$1'} marginTop='$2'>
                YoId: {profile.id}
              </SizableText>
            </YStack>
          </XStack >

          <XStack marginHorizontal="$4">
            <Paragraph>{profile.desc ?? '暂无简介'}</Paragraph>
          </XStack>

          {/* 互动 */}
          <XStack gap='$4' padding='$4' alignItems="center">
            <Link href={'/friend'} asChild>
              <XStack gap='$2' alignItems="center">
                <Text>4</Text>
                <Text fontSize='$2'>
                  关注
                </Text>
              </XStack>
            </Link>
            <Link href={'/friend'} asChild>
              <XStack gap='$2' alignItems="center">
                <Text>10</Text>
                <Text fontSize='$2'>
                  粉丝
                </Text>
              </XStack>
            </Link>
            <Link href={'/friend'} asChild>
              <XStack gap='$2' alignItems="center">
                <Text>0</Text>
                <Text fontSize='$2'>
                  获赞
                </Text>
              </XStack>
            </Link>

            <XStack flex={1} justifyContent="flex-end" gap="$3">
              <Button themeInverse size={'$2'} outlineColor={'white'} backgroundColor={'aliceblue'} borderRadius={50}>
                编辑资料
              </Button>
              <Button themeInverse size={'$2'} outlineColor={'white'} backgroundColor={'aliceblue'} borderRadius={50} icon={<Settings />} />
            </XStack>
          </XStack>

          {/* 快捷导航 */}
          <Navs></Navs>

        </YStack>
      </Theme>

      <Tabs></Tabs>
    </ScrollView>

  </YStack>
}

const Navs = () => {
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

const Tabs = () => {
  return <>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>
    <Text>1</Text>

  </>
}