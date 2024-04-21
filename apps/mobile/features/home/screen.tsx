import React, { useMemo, useState } from 'react'
import { TabBar, TabView } from 'react-native-tab-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Platform, useWindowDimensions } from 'react-native'
import { Pressable, Text, View } from '@gluestack-ui/themed'
import FollowFeed from './components/FollowFeed'
import HomeFeed from './components/HomeFeed'
import { NavButton } from '@/ui/components/NavButton'
import { useColor } from '@/utils/theme'

export function HomeScreen(): React.ReactNode {
  const { primaryColor } = useColor()
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
    <View
      flex={1}
      pt={top}
      bg="$backgroundLight0"
      $dark-bg="$backgroundDark950"
    >
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
            h={24}
            mx="$4"
            mb="$2"
            alignItems="center"
            style={{
              marginTop: Platform.select({
                web: 8,
              }),
            }}
          >
            <NavButton.Menu style={{ position: 'absolute', left: 0 }} />
            <NavButton.Search style={{ position: 'absolute', right: 0 }} />

            <View flex={1}>
              <TabBar
                {...props}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
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

                  return (
                    <Pressable
                      onPress={() => {
                        const index = TABS.findIndex(tab => tab.key === route.key)
                        setIndex(index)
                      }}
                    >
                      <Text>{route.title}</Text>
                    </Pressable>
                  )
                }}
              />
            </View>
          </View>
        )}
      >
      </TabView>
    </View>
  )
}
