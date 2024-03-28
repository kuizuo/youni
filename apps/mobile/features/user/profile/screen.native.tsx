import React, { memo, useState } from 'react'
import { Platform } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useRoute } from '@react-navigation/native'
import { ArrowUpRightFromSquare, Menu } from '@tamagui/lucide-icons'
import Animated, { interpolate, useAnimatedReaction, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { Tabs, useCurrentTabScrollY } from 'react-native-collapsible-tab-view'
import { InteractInfo } from './components/InteractInfo'
import { Navs } from './components/Nav'
import { UserNote } from './components/UserNote'
import { UserCollection } from './components/UserCollection'
import { UserLiked } from './components/UserLiked'
import { Avatar, Image, Paragraph, SizableText, View, XStack, YStack, useThemeName, useWindowDimensions } from '@/ui'
import { useUser } from '@/utils/auth/hooks/useUser'
import { trpc } from '@/utils/trpc'
import { NavBar, useNavBarHeight } from '@/ui/components/NavBar'
import { BackButton } from '@/ui/components/BackButton'
import { UserFollowButton } from '@/ui/components/user/UserFollowButton'

const TAB_BAR_HEIGHT = 32
const TAB_VIEW_MARGIN_TOP = -1

function getTopBarBg() {
  return '#334155'
}

export function ProfileScreen() {
  const { id: userId } = useLocalSearchParams<{ id: string }>()

  const window = useWindowDimensions()
  const route = useRoute()
  const isMe = route.name === 'me'

  const [headerHeight, setHeaderHeight] = useState(0)

  const scrollY = useSharedValue<number>(0)

  const navBarHeight = useNavBarHeight()

  const contentContainerStyle = {
    minHeight: window.height
    - navBarHeight
    + headerHeight
    + (Platform.OS === 'android' ? TAB_BAR_HEIGHT : 0) - TAB_VIEW_MARGIN_TOP,
    // paddingTop: headerHeight ? headerHeight + TAB_BAR_HEIGHT : 0,
  }

  const { data, isLoading, refetch, isRefetching } = trpc.user.byId.useQuery({ id: userId })

  const TABS = [
    {
      key: 'note',
      title: '笔记',
      component: <UserNote userId={userId} contentContainerStyle={contentContainerStyle} />,
    },
    {
      key: 'collection',
      title: '收藏',
      component: <UserCollection userId={userId} contentContainerStyle={contentContainerStyle} />,
    },
    {
      key: 'like',
      title: '赞过',
      component: <UserLiked userId={userId} contentContainerStyle={contentContainerStyle} />,
    },
  ]

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
          ? <BackButton color="white" />
          : <Menu color="white" size="$1" />}
        right={<ArrowUpRightFromSquare size="$1" color="white" />}
        style={{
          backgroundColor: getTopBarBg(),
          zIndex: 100,
        }}
      >
        <Animated.View
          style={[
            {
              flex: 1,
              width: '100%',
              position: 'absolute',
            },
            anim,
          ]}
        >
          <XStack flex={1} jc="space-between">
            <View fd="row" gap="$2.5" ai="center" bg="transport">
              <Avatar circular size="$2">
                <Avatar.Image
                // @ts-expect-error
                  source={{
                    uri: data?.avatar,
                    width: '100%',
                    height: '100%',
                  }}
                />
                <Avatar.Fallback />
              </Avatar>
              <SizableText themeInverse fontSize={14} opacity={0.7}>
                {data?.nickname}
              </SizableText>
            </View>
            <View justifyContent="flex-end">
              {!isMe && <UserFollowButton userId={userId} isFollowing={false} />}
            </View>
          </XStack>
        </Animated.View>
      </NavBar>
    )
  }

  const UserHeader = memo(() => {
    const { currentUser } = useUser()
    const route = useRoute()
    const isMe = route.name === 'me'

    const Y = useCurrentTabScrollY()

    useAnimatedReaction(
      () => Y.value,
      (newValue) => {
        scrollY.value = newValue
      },
      [Y],
    )

    const { id: userId } = useLocalSearchParams<{ id: string }>()

    const [data, { isLoading, refetch, isRefetching }] = trpc.user.byId.useSuspenseQuery({ id: userId }, {})

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
      <Tabs.Container
        allowHeaderOverscroll
        headerHeight={headerHeight}
        revealHeaderOnScroll={false}
        lazy
        snapThreshold={0.5}
        renderHeader={(props) => {
          return (
            <View
              onLayout={ev => setHeaderHeight(ev.nativeEvent.layout.height)}
              pointerEvents="box-none"
            >
              <UserHeader />
            </View>
          )
        }}
      >
        {TABS.map(({ component, key, title }) => {
          return (
            <Tabs.Tab name={title} key={key}>
              {component}
            </Tabs.Tab>
          )
        })}
      </Tabs.Container>
    </YStack>
  )
}
