import { createRef, memo, useMemo, useState } from 'react'
import { Platform } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useRoute } from '@react-navigation/native'
import { TabBar, TabView } from 'react-native-tab-view'
import { ArrowUpRightFromSquare, Menu } from '@tamagui/lucide-icons'
import { FlashList } from '@shopify/flash-list'
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { InteractInfo } from './components/InteractInfo'
import { Navs } from './components/Nav'
import { UserNote } from './components/UserNote'
import { UserCollection } from './components/UserCollection'
import { UserLiked } from './components/UserLiked'
import { trpc } from '@/utils/trpc'
import { NavBar, useNavBarHeight } from '@/ui/components/NavBar'
import { BackButton } from '@/ui/components/BackButton'
import { UserFollowButton } from '@/ui/components/user/UserFollowButton'
import { Avatar, Image, Paragraph, Separator, SizableText, View, XStack, YStack, useTheme, useThemeName, useWindowDimensions } from '@/ui'
import { useUser } from '@/utils/auth/hooks/useUser'

const TAB_BAR_HEIGHT = 32
const TAB_VIEW_MARGIN_TOP = -1

function getTopBarBg() {
  const themeName = useThemeName()
  return themeName === 'light' ? '#334155' : '#333345'
}

export function ProfileScreen() {
  const { id: userId } = useLocalSearchParams<{ id: string }>()

  const window = useWindowDimensions()
  const theme = useTheme()
  const route = useRoute()
  const isMe = route.name === 'me'

  const [index, setIndex] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)

  const scrollY = useSharedValue<number>(0)

  const minHeight = window.height
    - useNavBarHeight()
    + headerHeight
    + (Platform.OS === 'android' ? TAB_BAR_HEIGHT : 0)
    - TAB_VIEW_MARGIN_TOP

  const contentContainerStyle = {
    minHeight,
    paddingTop: headerHeight ? headerHeight + TAB_BAR_HEIGHT : 0,
  }

  const { data, isLoading, refetch, isRefetching } = trpc.user.byId.useQuery({ id: userId! })

  const TABS = useMemo(
    () => [
      {
        key: 'note',
        title: '笔记',
        scrollY: 0,
        ref: createRef<FlashList<any>>(),
      },
      {
        key: 'collection',
        title: '收藏',
        scrollY: 0,
        ref: createRef<FlashList<any>>(),
      },
      {
        key: 'like',
        title: '赞过',
        scrollY: 0,
        ref: createRef<FlashList<any>>(),
      },
    ],
    [],
  )

  const UserNavBar = () => {
    const anim = useAnimatedStyle(() => {
      return {
        opacity: interpolate(scrollY.value, [90, 120], [0, 1]),
        transform: [
          {
            translateY: interpolate(scrollY.value, [90, 130], [30, 0], 'clamp'),
          },
        ],
      }
    })

    return (
      <NavBar
        left={!isMe
          ? <BackButton />
          : <Menu color="white" size="$1" />}
        right={<ArrowUpRightFromSquare size="$1" color="white" />}
        style={{
          backgroundColor: getTopBarBg(),
          paddingBottom: 12,
          zIndex: 100,
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
            },
            anim,
          ]}
        >
          <XStack jc="center">
            <XStack flex={1} gap="$2.5" ai="center" bg="transport">
              <Avatar circular size="$2">
                <Avatar.Image
                // @ts-expect-error
                  source={{
                    uri: data?.avatar!,
                    width: '100%',
                    height: '100%',
                  }}
                />
                <Avatar.Fallback />
              </Avatar>
              <SizableText fontSize={14} opacity={0.7}>
                {data?.nickname}
              </SizableText>
            </XStack>
            {!isMe && <UserFollowButton userId={userId!} isFollowing={false} />}
          </XStack>
        </Animated.View>
      </NavBar>
    )
  }

  return (
    <YStack flex={1} bg="$background">
      <UserNavBar />
      {/* <Animated.Image
      source={require('@/assets/images/profile-background.png')}
      style={[anim, {
        position: 'absolute',
        width: '100%',
        height: 50,
        overflow: 'hidden',
        zIndex: -1,
      }]}
    /> */}
      <UserHeader />
      {/* <TabView
        style={{ marginTop: TAB_VIEW_MARGIN_TOP }}
        navigationState={{ index, routes: TABS }}
        onIndexChange={setIndex}
        lazy
        lazyPreloadDistance={1}
        initialLayout={{ width: window.width }}
        renderScene={({ route }) => {
          const currentRoute = TABS[index]!

          const senceProps = {
            userId: userId!,
            contentContainerStyle,
          }

          switch (route.key) {
            case 'note':
              return <UserNote {...senceProps} />
            case 'collection':
              return <UserCollection {...senceProps} />
            case 'like':
              return <UserLiked {...senceProps} />
            default:
              return null
          }
        }}
        renderTabBar={(props) => {
          const anim = useAnimatedStyle(() => {
            return {
              transform: [
                {
                  translateY: interpolate(scrollY.value, [0, headerHeight], [0, -headerHeight], 'clamp'),
                },
              ],
            }
          })

          return (
            <Animated.View
              pointerEvents="box-none"
              style={
            !!headerHeight && [
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                height: headerHeight,
              },
              anim,
              ]
          }
            >
              <View
                onLayout={ev => setHeaderHeight(ev.nativeEvent.layout.height)}
                pointerEvents="box-none"
              >
                <UserHeader />
              </View>

              <Separator />
              <View
                ai="center"
                px="$4"
                bg="$background"
                height={TAB_BAR_HEIGHT}
              >
                <TabBar
                  {...props}
                  style={{
                flexDirection: 'row',
                backgroundColor: 'transparent',
              }}
                  tabStyle={{
                width: 'auto',
                justifyContent: 'center',
                height: TAB_BAR_HEIGHT,
              }}
                  indicatorStyle={{
                height: 2,
                backgroundColor: theme.$accent10?.get(),
              }}
                  scrollEnabled
                  gap={16}
                  renderTabBarItem={(tabBarItemProps) => {
                const { route } = tabBarItemProps
                const active = TABS[index]!.key === route.key

                return (
                    <TouchableOpacity
                      {...tabBarItemProps}
                      style={{
              width: 'auto',
              height: TAB_BAR_HEIGHT,
              flexDirection: 'row',
              alignItems: 'center',
            }}
                      activeOpacity={1}
                      onPress={() => {
              const index = TABS.findIndex(tab => tab.key === route.key)
              setIndex(index)
            }}
                    >
                      <SizableText
              opacity={active ? 1 : 0.5}
              fontSize={16}
            >
              {route.title}
            </SizableText>
                    </TouchableOpacity>
                )
              }}
                />
              </View>
            </Animated.View>
          )
        }}
      >
      </TabView> */}
    </YStack>
  )
}

const UserHeader = memo(() => {
  const { currentUser } = useUser()
  const route = useRoute()
  const isMe = route.name === 'me'

  const { id: userId } = useLocalSearchParams<{ id: string }>()

  const [data, { isLoading, refetch, isRefetching }] = trpc.user.byId.useSuspenseQuery({ id: userId! }, {})

  return (
    <>
      <View bg={getTopBarBg()} paddingTop="$6" pointerEvents="none" />
      {/* 基本信息 */}
      <XStack gap="$4" px="$4" marginTop="$-5" marginBottom="$3">
        <Avatar circular size="$8">
          <Avatar.Image
            width="100%"
            height="100%"
          // @ts-expect-error
            source={{
              uri: data.avatar,
            }}
          />
          <Avatar.Fallback />
        </Avatar>
        <YStack flex={1} jc="flex-end">
          <XStack gap="$1.5" ai="center" marginBottom="$2">
            <SizableText fontSize={18}>
              {data.nickname}
            </SizableText>

            {data.gender
              ? (
                <Image
                  source={data.gender === 1 ? require('@/assets/icons/male.png') : require('@/assets/icons/female.png')}
                  width={20}
                  height={20}
                />
                )
              : <></>}
          </XStack>
          <Paragraph alignContent="flex-end">{data.desc ?? '暂无简介'}</Paragraph>
        </YStack>
      </XStack>

      {/* 互动 */}
      <InteractInfo user={data ?? currentUser!}></InteractInfo>
      {/* 快捷导航 */}
      {isMe && <Navs />}
    </>
  )
})
