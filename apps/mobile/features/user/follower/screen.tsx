import { YStack, View, SizableText, useTheme } from "@/ui"
import { useMemo } from "react"
import { TabbedHeaderPager } from "react-native-sticky-parallax-header"
import { Stack, useLocalSearchParams } from "expo-router"
import { trpc } from "@/utils/trpc"
import { FollowerList } from "./FollowerList"
import { Platform } from "react-native"

export const FollowerScreen = () => {
  const theme = useTheme()

  const { id, type, title } = useLocalSearchParams<{ id: string, type: 'following' | 'followers', title?: string }>()

  const { data, refetch } = trpc.user.byId.useQuery({ id })

  const TABS = useMemo(
    () => [
      {
        key: 'following',
        title: '关注',
        icon: <></>,
        component: () => <FollowerList key={'following'} userId={id} type='following'></FollowerList>,
      },
      {
        key: 'followers',
        title: '粉丝',
        icon: <></>,
        component: () => <FollowerList key={'followers'} userId={id} type='followers'></FollowerList>,
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
      showsVerticalScrollIndicator={false}
      initialPage={type === 'following' ? 0 : 1}
      renderHeader={() => <></>}
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
        return <View key={key} flex={1}>
          <Component />
        </View>
      })}
    </TabbedHeaderPager>
  </YStack>
}
