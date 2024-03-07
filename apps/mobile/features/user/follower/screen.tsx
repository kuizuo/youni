import { useUser } from "@/utils/auth/hooks/useUser"
import { Avatar, XStack, YStack, View, SizableText, Paragraph, Image, Theme, useTheme } from "@/ui"
import { useMemo } from "react"
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabbedHeaderPager } from "react-native-sticky-parallax-header"
import { window } from "@/constant"
import { useLocalSearchParams } from "expo-router";
import { trpc } from "@/utils/trpc";
import { InteractInfo } from "@/features/profile/components/InteractInfo";
import { Navs } from "@/features/profile/components/Nav";
import { UserCollections } from "@/features/profile/components/UserCollection";
import { UserNotes } from "@/features/profile/components/UserNotes";


export const ProfileScreen = () => {
  const theme = useTheme()
  const { top } = useSafeAreaInsets()
  const { profile } = useUser()

  const { id } = useLocalSearchParams<{ id: string }>();

  const userId = id ?? profile?.id!

  const TABS = useMemo(
    () => [
      {
        key: 'following',
        title: '关注',
        icon: <></>,
        component: () => <UserNotes userId={userId}></UserNotes>,
      },
      {
        key: 'followers',
        title: '粉丝',
        icon: <></>,
        component: () => <UserCollections userId={userId}></UserCollections>,
      },
      // {
      //   key: 'recommend',
      //   title: '推荐',
      // }
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
      renderHeaderBar={() => {
        return <View flexDirection='row' width='100%' justifyContent="center" backgroundColor={'transparent'}>
          <SizableText>{'用户名'}</SizableText>
        </View>
      }}
      renderHeader={() => {
        return <Theme name="dark">
          <YStack position="relative">
            <View marginBottom={top}></View>

            <Image
              source={require('@/assets/images/profile-background.png')}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
            <XStack gap='$4' padding='$4'>
              <Avatar circular size="$8">
                <Avatar.Image
                  width="100%"
                  height="100%"
                  source={require('@/assets/images/avatar.png')}
                />
                <Avatar.Fallback />
              </Avatar>
              <YStack flex={1} >
                <XStack gap="$2" alignItems='center'>
                  <SizableText size={16}>
                    {data.nickname}
                  </SizableText>

                  {data.gender ?
                    <Image
                      source={data.gender === 1 ? require('@/assets/icons/male.png') : require('@/assets/icons/female.png')}
                      width={20}
                      height={20}
                    /> : <></>
                  }
                </XStack>

                <SizableText size={'$1'} marginTop='$2'>
                  YoId: {data.yoId}
                </SizableText>
              </YStack>
            </XStack >

            <XStack marginHorizontal="$4">
              <Paragraph>{data.desc ?? '暂无简介'}</Paragraph>
            </XStack>

            {/* 互动 */}
            <InteractInfo userId={userId}></InteractInfo>
            {/* 快捷导航 */}
            {data.id === userId && <Navs />}
          </YStack>
        </Theme>
      }}
      showsVerticalScrollIndicator={false}
      tabs={TABS.map((tab) => ({
        title: tab.title,
        icon: tab.icon,
      }))}
      tabTextStyle={{
        color: theme.color?.get(),
      }}
      tabTextActiveStyle={{
        backgroundColor: 'transparent',
        borderBottomWidth: 2,
        borderBottomColor: 'red'
      }}
      tabTextContainerActiveStyle={{
        backgroundColor: 'transparent',
      }}
      tabsContainerStyle={{
        backgroundColor: theme.background?.get(),
        borderBottomWidth: 1,
        borderBottomColor: theme.borderColor?.get(),
      }}
      tabWrapperStyle={{
        padding: 0,
      }}
    >
      {TABS.map(({ key, component: Component }) => {
        return <View key={key} >
          <Component />
        </View>
      })}
    </TabbedHeaderPager>
  </YStack>
}
