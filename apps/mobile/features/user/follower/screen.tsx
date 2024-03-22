import { YStack, View, SizableText, useTheme } from "@/ui"
import React, { memo, useEffect, useMemo, useState } from "react"
import { router, useLocalSearchParams, useRouter } from "expo-router"
import { FollowerList } from "./FollowerList"
import { TabBar, TabView } from "react-native-tab-view"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { BackButton } from "@/ui/components/BackButton"

export const FollowerScreen = () => {
  const theme = useTheme()

  const { id, type, title } = useLocalSearchParams<{ id: string, type: 'following' | 'followers', title?: string }>()

  const { top } = useSafeAreaInsets()
  const [index, setIndex] = useState(0)

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

  useEffect(() => {
    if (type === 'following') {
      setIndex(0)
    } else {
      setIndex(1)
    }

  }, [type])

  return <YStack flex={1} position="relative" backgroundColor={'$background'} paddingTop={top}>
    <TabView
      navigationState={{ index, routes: TABS }}
      onIndexChange={setIndex}
      lazy
      renderScene={({ route }) =>
        route.key === 'following' ?
          <FollowingList userId={id} type='following'></FollowingList>
          :
          <FollowersList userId={id} type='followers'></FollowersList>
      }
      renderTabBar={(props) => {
        return <>
          <View position="relative" height={28} alignItems='center' paddingHorizontal={"$4"} >
            {<BackButton position="absolute" left={0} marginLeft={'$3'} />}

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
              indicatorContainerStyle={{}}
              scrollEnabled
              gap={16}
              renderTabBarItem={tabBarItemProps => {
                const { route } = tabBarItemProps
                const active = TABS[index]!.key === route.key

                return <SizableText
                  opacity={active ? 1 : 0.5}
                  fontSize={16}
                  onPress={() => {
                    const index = TABS.findIndex(tab => tab.key === route.key)
                    setIndex(index)
                  }}>
                  {route.title}
                </SizableText>
              }}
            />
          </View>
        </>
      }}
    >
    </TabView>
  </YStack>
}
