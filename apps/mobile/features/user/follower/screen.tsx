import { YStack, View, SizableText, useTheme } from "@/ui"
import { useMemo, useRef } from "react"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TabbedHeaderPager } from "react-native-sticky-parallax-header"
import { Stack, useLocalSearchParams } from "expo-router"
import { trpc } from "@/utils/trpc"
import { FollowerList } from "./FollowerList"
import { Platform } from "react-native"


export const FollowerScreen = () => {
  const theme = useTheme()
  const { top } = useSafeAreaInsets()

  const { id, type, title } = useLocalSearchParams<{ id: string, type: 'following' | 'followers', title?: string }>()

  const ref = useRef()

  const userId = id

  const { data, refetch } = trpc.user.byId.useQuery({ id: userId })

  const TABS = useMemo(
    () => [
      {
        key: 'following',
        title: '关注',
        icon: <></>,
        component: () => <FollowerList userId={userId} type='following'></FollowerList>,
      },
      {
        key: 'followers',
        title: '粉丝',
        icon: <></>,
        component: () => <FollowerList userId={userId} type='followers'></FollowerList>,
      },
      // {
      //   key: 'recommend',
      //   title: '推荐',
      // }
    ],
    [],
  )
  if (!data) {
    return <></>
  }

  return <YStack flex={1} position="relative" backgroundColor={'$background'}>
    <Stack.Screen options={{
      headerShown: true,
      headerShadowVisible: false,
      headerTitleAlign: 'center',
      headerTitle: title,
    }}></Stack.Screen>
    <TabbedHeaderPager
      enableSafeAreaTopInset={false}
      rememberTabScrollPosition
      renderHeader={() => <></>}
      showsVerticalScrollIndicator={false}
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
        default: 100,
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
}
