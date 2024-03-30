import React, { useMemo, useState } from 'react'
import { TabBar, TabView } from 'react-native-tab-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Menu, Search } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import type { IconProps } from '@tamagui/helpers-icon'
import FollowFeed from './components/FollowFeed'
import HomeFeed from './components/HomeFeed'
import { DrawerContainer } from '@/ui/components/DrawerContainer'
import { Text, View, YStack, useTheme, useWindowDimensions } from '@/ui'
import { useDrawerOpen } from '@/atoms/drawer'

export function HomeScreen(): React.ReactNode {
  const { top } = useSafeAreaInsets()
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

  function MenuButton(props: IconProps) {
    const [open, setOpen] = useDrawerOpen()

    return (
      <Menu
        size="$1"
        onPress={() => setOpen(true)}
        {...props}
      />
    )
  }

  function SearchButton(props: IconProps) {
    const router = useRouter()
    return (
      <Search size="$1" onPress={() => router.push('/search')} {...props} />
    )
  }

  return (
    <YStack flex={1} bg="$background" pt={top}>
      <DrawerContainer>
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
                <View position="relative" height={30} ai="center" mx="$4" mb="$2.5">
                  <MenuButton position="absolute" left={0} />
                  <SearchButton position="absolute" right={0} />

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
  )
}
