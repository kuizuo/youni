import React, { useMemo, useState } from 'react'
import { TabBar, TabView } from 'react-native-tab-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FollowFeed from './components/FollowFeed'
import HomeFeed from './components/HomeFeed'
import { Text, View, YStack, useTheme, useWindowDimensions } from '@/ui'
import { NavButton } from '@/ui/components/NavButton'
import tw from '@/utils/tw'

export function HomeScreen(): React.ReactNode {
  const { top } = useSafeAreaInsets()

  const [index, setIndex] = useState(0)
  const { width: windowWidth } = useWindowDimensions()

  const TABS = useMemo(
    () => [
      {
        key: 'explore',
        title: '发现',
      },
      {
        key: 'follow',
        title: '关注',
      },
    ],
    [],
  )

  return (
    <View style={tw`flex-1 pt-[${top}px]`}>
      <TabView
        navigationState={{ index, routes: TABS }}
        onIndexChange={setIndex}
        overScrollMode="never"
        lazy
        lazyPreloadDistance={1}
        initialLayout={{ width: windowWidth }}
        renderScene={({ route }) => {
          switch (route.key) {
            case 'explore':
              return <HomeFeed />
            case 'follow':
              return <FollowFeed />
            default:
              return null
          }
        }}
        renderTabBar={props => (
          <View style={tw`relative h-[30px] mx-4 mb-2 items-center`}>
            <NavButton.Menu position="absolute" left={0} />
            <NavButton.Search position="absolute" right={0} />

            <TabBar
              {...props}
              style={tw`flex-1 justify-center bg-transparent`}
              tabStyle={{
                height: 50,
              }}
              indicatorStyle={tw`h-[2px] items-center w-1/2 bg-primary`}
              indicatorContainerStyle={{
                borderBottomWidth: 0,
              }}
              scrollEnabled
              gap={16}
              renderTabBarItem={(tabBarItemProps) => {
                const { route } = tabBarItemProps
                const active = TABS[index]!.key === route.key

                return (
                  <Text
                    opacity={active ? 1 : 0.5}
                    style={tw`text-base`}
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
