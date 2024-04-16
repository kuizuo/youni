import React, { useMemo, useState } from 'react'
import { TabBar, TabView } from 'react-native-tab-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useWindowDimensions } from 'react-native'
import { Text, View, useToken } from '@gluestack-ui/themed'
import FollowFeed from './components/FollowFeed'
import HomeFeed from './components/HomeFeed'
import { NavButton } from '@/ui/components/NavButton'

export function HomeScreen(): React.ReactNode {
  const primaryColor = useToken('colors', 'primary500')
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
    <View flex={1} pt={top} bg="$backgroundLight0">
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
          <View
            position="relative"
            h={28}
            mx="$4"
            mb="$2"
            alignItems="center"
          >
            <NavButton.Menu style={{ position: 'absolute', left: 0 }} />
            <NavButton.Search style={{ position: 'absolute', right: 0 }} />

            <TabBar
              {...props}
              style={{
                justifyContent: 'center',
                backgroundColor: 'transparent',
              }}
              tabStyle={{
                height: 50,
              }}
              indicatorStyle={{
                height: 2,
                width: '50%',
                justifyContent: 'center',
                backgroundColor: primaryColor,
              }}
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
                    className={`text-base ${active ? 'opacity-100' : 'opacty-50'}`}
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
