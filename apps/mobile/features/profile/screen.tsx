import { Platform } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabbedHeaderPager } from "react-native-sticky-parallax-header"

import { useUser } from "@/utils/auth/hooks/useUser"
import { Theme, YStack, View, useTheme } from "@/ui"
import { useMemo } from "react"
import { InteractInfo } from "./components/InteractInfo";
import { Navs } from "./components/Nav";
import { UserNote } from "./components/UserNote";
import { UserCollection } from "./components/UserCollection";
import { UserLiked } from "./components/UserLiked";
import { useLocalSearchParams } from "expo-router";
import { trpc } from "@/utils/trpc";
import { BasicInfo } from "./components/BasicInfo";
import { UserInfo } from "@server/modules/user/user";

export const ProfileScreen = () => {
  const theme = useTheme()
  const { top } = useSafeAreaInsets()
  const { profile } = useUser()

  const { id } = useLocalSearchParams<{ id: string }>();

  const userId = id || profile?.id!

  const TABS = useMemo(
    () => [
      {
        key: 'note',
        title: '笔记',
        icon: <></>,
        component: () => <UserNote userId={userId}></UserNote>,
      },
      {
        key: 'collection',
        title: '收藏',
        icon: <></>,
        component: () => <UserCollection userId={userId}></UserCollection>,
      },
      {
        key: 'like',
        title: '赞过',
        icon: <></>,
        component: () => <UserLiked userId={userId}></UserLiked>,
      }
    ],
    [],
  )

  const { data, refetch } = trpc.user.byId.useQuery({ id: userId })

  if (!data) {
    return <></>
  }

  return <YStack flex={1} position="relative" backgroundColor={'$background'}>

    <TabbedHeaderPager
      rememberTabScrollPosition
      // renderHeaderBar={() => {
      //   return <View flexDirection='row' width='100%' justifyContent="space-between" backgroundColor={'transparent'}>
      //     <Button>1</Button>
      //     <Button>2</Button>
      //   </View>
      // }}
      renderHeader={() => {
        return <YStack>
          <Theme name="dark">
            <View marginBottom={top} />
            {/* 基本信息 */}
            <BasicInfo data={data as unknown as UserInfo} />
            {/* 互动 */}
            <InteractInfo userId={userId} nickname={data.nickname}></InteractInfo>
            {/* 快捷导航 */}
            {userId === profile?.id && <Navs />}

          </Theme>
        </YStack>
      }}
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
