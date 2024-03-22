import { View, Text, YStack, useTheme } from '@/ui'

import { useMemo, useState } from "react"
import { HomeFeed } from './components/HomeFeed'
import { FollowFeed } from './components/FollowFeed'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view'
import React from 'react'
import { DrawerContainer } from '@/ui/components/DrawerContainer'
import { HomeHeader } from './components/HomeHeader'

export const HomeScreen = (): React.ReactNode => {
  const theme = useTheme()

  const [index, setIndex] = useState(0)

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

  const renderScene = SceneMap({
    explore: HomeFeed,
    follow: FollowFeed,
  })

  return (<>
    <YStack flex={1} backgroundColor={'$background'}>
      <DrawerContainer>
        <HomeHeader />

        <TabView
          navigationState={{ index, routes: TABS }}
          onIndexChange={setIndex}
          lazy
          lazyPreloadDistance={1}
          renderScene={renderScene}
          renderTabBar={(props) => {
            return <>
              <View height={24} alignItems='center' paddingHorizontal={"$4"} marginBottom="$2">
                <TabBar
                  {...props}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: 'transparent'
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
                  indicatorContainerStyle={{}}
                  scrollEnabled
                  gap={16}
                  renderTabBarItem={tabBarItemProps => {
                    const { route } = tabBarItemProps
                    const active = TABS[index]!.key === route.key

                    return (
                      <Text opacity={active ? 1 : 0.5} fontSize={16} onPress={() => {
                        const index = TABS.findIndex(tab => tab.key === route.key)
                        setIndex(index)
                      }}>{route.title}</Text>
                    )
                  }}
                />
              </View>
            </>
          }}
        >

        </TabView>
      </DrawerContainer>
    </YStack>
  </>
  )
}