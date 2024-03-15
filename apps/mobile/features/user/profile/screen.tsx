import { Platform } from "react-native";
import { TabbedHeaderPager } from "react-native-sticky-parallax-header"

import { useUser } from "@/utils/auth/hooks/useUser"
import { Theme, YStack, View, Image, useTheme } from "@/ui"
import React, { useMemo } from "react"
import { InteractInfo } from "./components/InteractInfo";
import { Navs } from "./components/Nav";
import { UserNote } from "./components/UserNote";
import { UserCollection } from "./components/UserCollection";
import { UserLiked } from "./components/UserLiked";
import { BasicInfo } from "./components/BasicInfo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { trpc } from "@/utils/trpc";
import { ProfileHeader } from "./components/ProfileHeader";
import { useRoute } from "@react-navigation/native";

export const ProfileScreen = () => {
  const theme = useTheme()
  const route = useRoute()
  const { currentUser } = useUser()

  const { id: userId } = useLocalSearchParams<{ id: string }>();

  const isMe = currentUser?.id === userId && route.name === 'me'

  const { data, isLoading, refetch, isRefetching } = trpc.user.byId.useQuery({ id: userId }, {
    enabled: !isMe,
  })

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

  return <YStack fullscreen flex={1} position="relative" backgroundColor={'$background'}>
    <TabbedHeaderPager
      enableSafeAreaTopInset={false}
      showsVerticalScrollIndicator={false}
      rememberTabScrollPosition
      renderHeaderBar={() => {
        return <></>
      }}
      renderHeader={() => {
        return <YStack flex={1} gap='$2'>
          <Image
            source={require('@/assets/images/profile-background.png')}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          />
          <ProfileHeader showGobackButton={!isMe} />
          <Theme name="dark">
            {/* 基本信息 */}
            <BasicInfo data={data ?? currentUser!} />
            {/* 互动 */}
            <InteractInfo user={data ?? currentUser!}></InteractInfo>
            {/* 快捷导航 */}
            {isMe && <Navs />}
          </Theme>
        </YStack>
      }}
      // refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
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
      tabUnderlineColor={theme.$accent10?.get()}
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
