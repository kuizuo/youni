import React from 'react';
import { Link, Tabs, useNavigation, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Platform } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from "nativewind";
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';


// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
}) {
  return <Feather size={24} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          borderWidth: 0,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          headerTitle: '',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Link href="/search" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Feather
                    name="search"
                    size={24}
                    color={Colors[colorScheme ?? 'light'].text}
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
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="publish"
        options={{
          title: '',
          tabBarButton: () => {
            return <View className={`flex justify-center mb-6}`} >
              <MaterialCommunityIcons name="plus-circle" size={48} color={'skyblue'} onPress={() => {
                router.push('/publish')
              }} />
            </View>
          }
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: '消息',
          tabBarIcon: ({ color }) => <TabBarIcon name="message-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}



