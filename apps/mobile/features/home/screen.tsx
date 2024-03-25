import React, { useMemo, useState } from 'react'
import { TabBar, TabView } from 'react-native-tab-view'
import HomeFeed from './components/HomeFeed'
import FollowFeed from './components/FollowFeed'
import { HomeHeader } from './components/HomeHeader'
import { DrawerContainer } from '@/ui/components/DrawerContainer'
import { Text, View, YStack, useTheme, useWindowDimensions } from '@/ui'

export function HomeScreen(): React.ReactNode {
  const theme = useTheme()

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
    <>
      <YStack flex={1} backgroundColor="$background">
        <DrawerContainer>
          <HomeHeader />

          <TabView
            navigationState={{ index, routes: TABS }}
            onIndexChange={setIndex}
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
            renderTabBar={(props) => {
              return (
                <>
                  <View height={24} alignItems="center" paddingHorizontal="$4" marginBottom="$2">
                <TabBar
                    {...props}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      backgroundColor: 'transparent',
                    }}
                    tabStyle={{
                      height: 50,
                    }}
                    indicatorStyle={{
                      height: 2,
                      alignItems: 'center',
                      width: '50%',
                      backgroundColor: theme.$accent10?.get(),
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
                          opacity={active ? 1 : 0.5}
                          fontSize={16}
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
                </>
              )
            }}
          >

          </TabView>
        </DrawerContainer>
      </YStack>
    </>
  )
}
