import { View, YStack, useTheme } from '@/ui'

import { TabbedHeaderPager } from "react-native-sticky-parallax-header"
import { useMemo } from "react"
import { HomeFeed } from './components/HomeFeed'
import { FollowFeed } from './components/FollowFeed'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SearchBar } from './components/SearchBar'

export const HomeScreen = (): React.ReactNode => {
  const theme = useTheme()
  const { top } = useSafeAreaInsets()

  const TABS = useMemo(
    () => [
      {
        key: 'explore',
        title: '发现',
        icon: <></>,
        component: () => <HomeFeed></HomeFeed>,
      },
      {
        key: 'follow',
        title: '关注',
        icon: <></>,
        component: () => <FollowFeed></FollowFeed>,
      },
    ],
    [],
  )

  return (
    <YStack flex={1} backgroundColor={'$background'}>
      <TabbedHeaderPager
        rememberTabScrollPosition
        renderHeaderBar={() => {
          return <View marginTop={top}></View>
        }}
        renderHeader={() => <SearchBar />}
        headerHeight={0}
        parallaxHeight={0}
        enableSafeAreaTopInset
        showsVerticalScrollIndicator={false}
        stickyTabs
        initialPage={0}

        tabs={TABS.map((tab) => ({
          title: tab.title,
          icon: tab.icon,
        }))}
        tabTextStyle={{
          color: theme.color?.get(),
          padding: 0
        }}
        tabTextActiveStyle={{
          backgroundColor: 'transparent',
        }}
        tabTextContainerStyle={{
          padding: 0
        }}
        tabTextContainerActiveStyle={{
          backgroundColor: 'transparent',
        }}
        tabWrapperStyle={{
          paddingVertical: 0,
        }}
        tabUnderlineColor={'red'}
        tabsContainerStyle={{
          backgroundColor: theme.background?.get(),
          flex: 1,
          maxWidth: Platform.select({
            web: 200,
          }),
          margin: Platform.select({
            web: 'auto',
          }),
        }}
        tabsContainerHorizontalPadding={Platform.select({
          default: 120,
          web: 0
        })}
      >
        {TABS.map(({ key, component: Component }) => {
          return <View key={key} >
            <Component />
          </View>
        })}
      </TabbedHeaderPager>
    </YStack>
  )
}