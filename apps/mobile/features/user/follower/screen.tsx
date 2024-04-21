import React, { memo, useMemo, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { TabBar, TabView } from 'react-native-tab-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, View, useToken } from '@gluestack-ui/themed'
import { useWindowDimensions } from 'react-native'
import { FollowerList } from './FollowerList'
import { NavButton } from '@/ui/components/NavButton'
import { useColor } from '@/utils/theme'

export function FollowerScreen() {
  const { primaryColor } = useColor()
  const { id, type, title } = useLocalSearchParams<{ id: string, type: 'following' | 'followers', title?: string }>()

  const { top } = useSafeAreaInsets()

  const [index, setIndex] = useState(type === 'following' ? 0 : 1)

  const { width: windowWidth } = useWindowDimensions()

  const TABS = useMemo(
    () => [
      {
        key: 'following',
        title: '关注',
      },
      {
        key: 'followers',
        title: '粉丝',
      },
      // {
      //   key: 'recommend',
      //   title: '推荐',
      // }
    ],
    [],
  )

  const FollowingList = memo(FollowerList)
  const FollowersList = memo(FollowerList)

  return (
    <View flex={1} position="relative" pt={top}>
      <TabView
        navigationState={{ index, routes: TABS }}
        onIndexChange={setIndex}
        lazy
        lazyPreloadDistance={1}
        initialLayout={{ width: windowWidth }}
        renderScene={({ route }) =>
          route.key === 'following'
            ? <FollowingList userId={id} type="following"></FollowingList>
            : <FollowersList userId={id} type="followers"></FollowersList>}
        renderTabBar={props => (
          <View className="relative mx-4 px-4 h-[24px] items-center">
            <NavButton.Back style={{ position: 'absolute', left: 0 }} />

            <TabBar
              {...props}
              style={{
                flex: 1,
                justifyContent: 'center',
                backgroundColor: 'transparent',
              }}
              tabStyle={{ height: 50 }}
              indicatorStyle={{
                height: 2,
                width: '50%',
                justifyContent: 'center',
                backgroundColor: primaryColor,
              }}
              scrollEnabled
              gap={16}
              renderTabBarItem={(tabBarItemProps) => {
                const { route } = tabBarItemProps
                const active = TABS[index]!.key === route.key

                return (
                  <Text
                    opacity={active ? 1 : 0.5}
                    size="md"
                    onPress={() => {
                      const index = TABS.findIndex(tab => tab.key === route.key)
                      setIndex(index)
                    }}
                  >
                    {route.title}
                  </Text>
                )
              }}
            />
          </View>
        )}
      >
      </TabView>
    </View>
  )
}
