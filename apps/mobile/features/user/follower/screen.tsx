import React, { memo, useMemo, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { TabBar, TabView } from 'react-native-tab-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FollowerList } from './FollowerList'
import { SizableText, View, useWindowDimensions } from '@/ui'
import { NavButton } from '@/ui/components/NavButton'
import tw from '@/utils/tw'

export function FollowerScreen() {
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
    <View style={tw`flex-1 relative pt-[${top}px] bg-background`}>
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
        renderTabBar={(props) => {
          return (
            <>
              <View style={tw`relative px-4 h-[28px] items-center`}>
                <NavButton.Back position="absolute" left={0} marginLeft="$3" />

                <TabBar
                  {...props}
                  style={tw`flex-1 justify-center bg-transparent`}
                  tabStyle={{ height: 50 }}
                  indicatorStyle={tw`h-[2px] w-1/2 bg-primary items-center`}
                  scrollEnabled
                  gap={16}
                  renderTabBarItem={(tabBarItemProps) => {
                    const { route } = tabBarItemProps
                    const active = TABS[index]!.key === route.key

                    return (
                      <SizableText
                        opacity={active ? 1 : 0.5}
                        style={tw`text-base`}
                        onPress={() => {
                          const index = TABS.findIndex(tab => tab.key === route.key)
                          setIndex(index)
                        }}
                      >
                        {route.title}
                      </SizableText>
                    )
                  }}
                />
              </View>
            </>
          )
        }}
      >
      </TabView>
    </View>
  )
}
