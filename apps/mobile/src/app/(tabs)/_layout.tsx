import React from 'react';
import { Link, Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Avatar, Circle, Theme, YStack, useThemeName } from 'tamagui'
import { LinearGradient } from '@tamagui/linear-gradient'
import { Plus, Home, ShoppingCart, MessageCircleMore } from '@tamagui/lucide-icons'
import { Image } from 'expo-image'
import colors from "tailwindcss/colors";

import { Feather } from '@expo/vector-icons';
import { useUser } from '@/utils/useUser';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderWidth: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerRight: () => (
            <Link href="/search" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Feather
                    name="search"
                    size={24}
                    color={colors.pink[600]}
                    style={{ marginBottom: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: '购物',
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="_create"
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            event.preventDefault()
            navigation.navigate('create')
          },
        })}
        options={{
          title: '',
          tabBarIcon: ({ size }) => {
            return (
              <Theme inverse>
                <PlusButton size={size} />
              </Theme>
            )
          },
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: '消息',
          tabBarIcon: ({ color, size }) => <MessageCircleMore color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => {
            const { avatarUrl } = useUser()

            return (
              <YStack borderWidth="$1" borderColor={color} borderRadius="$10">
                <Avatar circular p="$1" size={size}>
                  <Image source={avatarUrl} alt="your avatar" style={{ width: size, height: size, }} />
                </Avatar>
              </YStack>
            )
          },
        }}
      />
    </Tabs>
  );
}


const PlusButton = ({ size }: { size: number }) => {
  const router = useRouter()
  const theme = useThemeName()
  const isDark = theme.startsWith('dark')

  return (
    <>
      <Circle
        pos="absolute"
        bottom={8}
        backgroundColor="$color1"
        shadowColor='black'
        shadowOpacity={isDark ? 0.7 : 1}
        shadowRadius={isDark ? 3 : 10}
        shadowOffset={{
          height: 0,
          width: 5,
        }}
        width={size + 24}
        height={size + 24}
      />
      <LinearGradient
        onPress={() => router.push('/create')}
        colors={['$gray6', '$gray7']}
        start={[1, 1]}
        end={[0.8, 0]}
        width={size + 24}
        height={size + 24}
        borderRadius="$10"
        pos="absolute"
        bottom={8}
        pressStyle={{
          rotate: '20deg',
        }}
      />
      <YStack
        pos="absolute"
        bottom={8}
        jc="center"
        ai="center"
        animation="quick"
        pointerEvents="none"
        height={size + 24}
      >
        <Plus color="$color" size={size + 16} />
      </YStack>
    </>
  )
}
