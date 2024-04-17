import { useState } from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useRoute } from '@react-navigation/native'
import { ArrowUpRightFromSquare } from 'lucide-react-native'
import Animated, { Extrapolation, interpolate, useAnimatedReaction, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { MaterialTabBar, Tabs, useCurrentTabScrollY } from 'react-native-collapsible-tab-view'
import { Avatar, AvatarImage, HStack, Image, Text, View, useToken } from '@gluestack-ui/themed'
import { useColorScheme } from 'nativewind'
import { InteractInfo } from './components/InteractInfo'
import { Navs } from './components/Nav'
import { UserNote } from './components/UserNote'
import { UserCollection } from './components/UserCollection'
import { UserLiked } from './components/UserLiked'
import { useAuth } from '@/utils/auth'
import { trpc } from '@/utils/trpc'
import { NavBar, NavButton, useNavBarHeight } from '@/ui/components/NavBar'

const TAB_BAR_HEIGHT = 32
const TAB_VIEW_MARGIN_TOP = -1

const VERTICAL_SPACING = 12
const ROOT_HORIZONTAL_PADDING = 12
const AVATAR_SIZE_VALUE = 60
const BANNER_BOTTOM_HEIGHT_ADDITION = AVATAR_SIZE_VALUE

export function ProfileScreen() {
  const { colorScheme } = useColorScheme()
  const primaryColor = useToken('colors', 'primary500')
  const bgColor = useToken('colors', colorScheme === 'dark' ? 'backgroundLight800' : 'backgroundLight200')

  const { id: userId } = useLocalSearchParams<{ id: string }>()

  const window = useWindowDimensions()
  const route = useRoute()

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

  const [data] = trpc.user.byId.useSuspenseQuery({ id: userId })

  const TABS = [
    {
      key: 'note',
      title: '笔记',
      component: <UserNote {...{ userId, contentContainerStyle }} />,
    },
    {
      key: 'collection',
      title: '收藏',
      component: <UserCollection {...{ userId, contentContainerStyle }} />,
    },
    {
      key: 'like',
      title: '赞过',
      component: <UserLiked {...{ userId, contentContainerStyle }} />,
    },
  ]

  const NavBarComponent = () => {
    const { left, right } = useSafeAreaInsets()
    const { width, height } = useWindowDimensions()
    const bannerHeight = useSharedValue(48 + BANNER_BOTTOM_HEIGHT_ADDITION)

    const blurStyle = useAnimatedStyle(() => {
      const blurOpacity = interpolate(Math.abs(scrollY.value), [0, 40], [0, 1], Extrapolation.CLAMP)

      return { opacity: blurOpacity }
    })

    const bannerImageStyle = useAnimatedStyle(() => {
      const bannerTranslation = interpolate(
        scrollY.value,
        [0, BANNER_BOTTOM_HEIGHT_ADDITION],
        [0, -BANNER_BOTTOM_HEIGHT_ADDITION],
        Extrapolation.CLAMP,
      )

      return { transform: [{ translateY: bannerTranslation }] }
    })

    // This allows the profile container to translate as the user scrolls.
    const profileContainerTranslationStyle = useAnimatedStyle(() => {
      const translateY = -scrollY.value + BANNER_BOTTOM_HEIGHT_ADDITION / 2

      return { transform: [{ translateY }] }
    })

    // Once the profile image has been scaled down, we allow the profile container to be
    // hidden behind the banner. This is done by setting the zIndex to -1.
    const rootProfileRowZIndexStyle = useAnimatedStyle(() => {
      return { zIndex: scrollY.value <= BANNER_BOTTOM_HEIGHT_ADDITION ? 1 : -1 }
    })

    const animatedScaleStyle = useAnimatedStyle(() => {
      const bannerHeightRatio = height / bannerHeight.value

      const scaleY = interpolate(
        scrollY.value,
        [0, -(height + bannerHeight.value)],
        [1, bannerHeightRatio],
        Extrapolation.CLAMP,
      )

      return {
        transform: [{ scaleY }, { scaleX: scaleY }],
      }
    }, [height])

    const animatedNavBarStyle = useAnimatedStyle(() => {
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
      <View position="relative" zIndex={1}>
        {/* 顶部背景 */}
        <Animated.View className="absolute inset-0" style={[bannerImageStyle]}>
          <Animated.View
            onLayout={e => (bannerHeight.value = e.nativeEvent.layout.height)}
            style={animatedScaleStyle}
          >
            <View style={{ marginBottom: -BANNER_BOTTOM_HEIGHT_ADDITION }}>
              <Animated.View className="absolute inset-0 z-1" style={[blurStyle]}>
                <BlurView className="absolute inset-0" intensity={50} />
              </Animated.View>

              <Image
                source={require('../../../assets/images/profile-background.png')}
                style={[
                  { width },
                  Platform.OS === 'web' && { height: bannerHeight.value },
                ]}
              />
            </View>
          </Animated.View>
        </Animated.View>

        {/* 导航条 */}
        <NavBar
          left={route.name !== 'me'
            ? <NavButton.Back size="xl" />
            : <NavButton.Menu size="xl" />}
          right={<ArrowUpRightFromSquare size="xl" />}
        >
          <Animated.View style={[animatedNavBarStyle]}>
            <HStack flex={1} justifyContent="space-between">
              <View flexDirection="row" gap="$2.5" alignContent="center" bg="transport">
                <Avatar borderRadius="$full" size="sm">
                  <AvatarImage
                    source={{
                      uri: data?.avatar,
                    }}
                  />

                </Avatar>
                <Text size="md">
                  {data?.nickname}
                </Text>
              </View>
            </HStack>
          </Animated.View>
        </NavBar>

        {/* 用户头像 */}
        <Animated.View className="px-2" style={[rootProfileRowZIndexStyle]}>
          <Animated.View
            className="absolute left-3 right-3 flex flex-row justify-between items-end gap-3"
            style={[
              {
                left: Math.max(left, ROOT_HORIZONTAL_PADDING),
                right: Math.max(right, ROOT_HORIZONTAL_PADDING),
              },
              profileContainerTranslationStyle,
            ]}
          >
            <Avatar borderRadius="$full" size="xl">
              <AvatarImage
                source={{
                  uri: data?.avatar,
                }}
              />
            </Avatar>
            <View flex={1}>
              <View mb="$2" gap="$2" alignContent="center">
                <Text size="lg">
                  {data.nickname}
                </Text>
                {data.gender
                  ? (
                    <Image
                      source={data.gender === 1 ? require('@/assets/icons/male.png') : require('@/assets/icons/female.png')}
                      width={20}
                      height={20}
                    />
                    )
                  : <></>}
              </View>
              <Text size="md">{' '}</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    )
  }

  const HeaderComponent = () => {
    const { currentUser } = useAuth()
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
      <View mt={AVATAR_SIZE_VALUE / 2 + VERTICAL_SPACING + BANNER_BOTTOM_HEIGHT_ADDITION}>
        <View pt={AVATAR_SIZE_VALUE} pointerEvents="none" />
        {/* 基本信息 */}
        <View px="$4" mb="$3">
          <Text>{data.desc ?? '暂无简介'}</Text>
        </View>

        {/* 互动 */}
        <InteractInfo user={data ?? currentUser!}></InteractInfo>
        {/* 快捷导航 */}
        {isMe && <Navs />}
      </View>
    )
  }

  return (
    <View flex={1}>
      <NavBarComponent />

      <Tabs.Container
        allowHeaderOverscroll
        headerHeight={headerHeight}
        revealHeaderOnScroll={false}
        lazy
        snapThreshold={0.5}
        headerContainerStyle={{ shadowOpacity: 0 }}
        renderHeader={props => (
          <View
            onLayout={ev => setHeaderHeight(ev.nativeEvent.layout.height)}
            pointerEvents="box-none"
          >
            <HeaderComponent />
          </View>
        )}
        renderTabBar={props => (
          <MaterialTabBar
            {...props}
            indicatorStyle={{ backgroundColor: primaryColor }}
            activeColor={primaryColor}
            labelStyle={{ color: primaryColor }}
            tabStyle={bgColor}
          />
        )}
      >
        {TABS.map(({ component, key, title }) => (
          <Tabs.Tab name={title} key={key}>
            {component}
          </Tabs.Tab>
        ))}
      </Tabs.Container>
    </View>
  )
}
