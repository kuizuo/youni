import { useCallback, useState } from 'react'
import { Platform, StyleSheet, useWindowDimensions } from 'react-native'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useRoute } from '@react-navigation/native'
import { ArrowUpRightFromSquare } from 'lucide-react-native'
import Animated, { Extrapolation, interpolate, useAnimatedReaction, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { MaterialTabBar, Tabs, useCurrentTabScrollY } from 'react-native-collapsible-tab-view'
import {
  Avatar,
  AvatarImage,
  Badge,
  BadgeText,
  HStack,
  Icon,
  Image,
  Pressable,
  Text,
  VStack,
  View,
} from '@gluestack-ui/themed'
import { InteractInfo } from './components/InteractInfo'
import { Navs } from './components/Nav'
import { UserNote } from './components/UserNote'
import { UserCollection } from './components/UserCollection'
import { UserLiked } from './components/UserLiked'
import { useAuth } from '@/utils/auth'
import { trpc } from '@/utils/trpc'
import { NavBar, NavButton, useNavBarHeight } from '@/ui/components/NavBar'
import { useColor } from '@/utils/theme'

const TAB_BAR_HEIGHT = 32
const TAB_VIEW_MARGIN_TOP = -1

const VERTICAL_SPACING = 12
const ROOT_HORIZONTAL_PADDING = 12
const AVATAR_SIZE_VALUE = 60
const BANNER_BOTTOM_HEIGHT_ADDITION = AVATAR_SIZE_VALUE

export function ProfileScreen() {
  const router = useRouter()
  const window = useWindowDimensions()
  const route = useRoute()
  const { primaryColor, textColor, bgColor } = useColor()

  const { id: userId } = useLocalSearchParams<{ id: string }>()

  const [headerHeight, setHeaderHeight] = useState(0)

  const scrollY = useSharedValue<number>(0)

  const navBarHeight = useNavBarHeight()

  const contentContainerStyle = {
    minHeight: window.height
    - navBarHeight
    + headerHeight
    + (Platform.OS === 'android' ? TAB_BAR_HEIGHT : 0) - TAB_VIEW_MARGIN_TOP,
    // paddingTop: (headerHeight ? headerHeight + TAB_BAR_HEIGHT : TAB_BAR_HEIGHT) + VERTICAL_SPACING / 2,
  }

  const [data, { refetch }] = trpc.user.byId.useSuspenseQuery({ id: userId })

  useFocusEffect(
    useCallback(() => {
      refetch()
      return () => {
      }
    }, []),
  )

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
        <Animated.View style={[StyleSheet.absoluteFill, bannerImageStyle]}>
          <Animated.View
            onLayout={e => (bannerHeight.value = e.nativeEvent.layout.height)}
            style={animatedScaleStyle}
          >
            <View style={{ marginBottom: -BANNER_BOTTOM_HEIGHT_ADDITION }}>
              <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 1 }, blurStyle]}>
                <BlurView intensity={50} />
              </Animated.View>

              <Image
                source={require('./assets/images/profile-background.png')}
                style={[
                  {
                    width,
                    height: '100%',
                  },
                  Platform.OS === 'web' && { height: bannerHeight.value },
                ]}
                alt="image"
              />
            </View>
          </Animated.View>
        </Animated.View>

        {/* 导航条 */}
        <NavBar
          left={route.name !== 'me'
            ? <NavButton.Back size="xl" color="$backgroundLight200" />
            : <NavButton.Menu size="xl" color="$backgroundLight200" />}
          right={<Icon as={ArrowUpRightFromSquare} size="xl" color="$backgroundLight200" />}
        >
          <Animated.View style={[animatedNavBarStyle]}>
            <HStack flex={1} justifyContent="space-between">
              <View flexDirection="row" gap="$2.5" alignItems="center">
                <Avatar borderRadius="$full" overflow="hidden" size="sm">
                  <AvatarImage
                    source={{ uri: data?.avatar }}
                    alt="avatar"
                  />
                </Avatar>
                <Text size="md">
                  {data?.nickname}
                </Text>
              </View>
            </HStack>
          </Animated.View>
        </NavBar>

        {/* 用户头像以及昵称 */}
        <Animated.View className="px-2" style={[rootProfileRowZIndexStyle]}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                gap: 6,
              },
              {
                left: Math.max(left, ROOT_HORIZONTAL_PADDING),
                right: Math.max(right, ROOT_HORIZONTAL_PADDING),
              },
              profileContainerTranslationStyle,
            ]}
          >
            <Avatar size="xl" overflow="hidden" borderRadius="$full" bg={bgColor}>
              <AvatarImage
                source={{ uri: data?.avatar }}
                alt="avatar"
                resizeMode="contain"
              />
            </Avatar>
            <VStack flex={1} ml="$2" h="$full" gap="$2">
              <HStack alignItems="center" gap="$2" mt="$8">
                <Text size="lg">
                  {data.nickname}
                </Text>
                {data.gender
                  ? (
                    <Image
                      source={data.gender === 1 ? require('./assets/icons/male.png') : require('./assets/icons/female.png')}
                      width={20}
                      height={20}
                      alt="image"
                    />
                    )
                  : <></>}
              </HStack>

              <HStack>
                {data.campus
                  ? (
                    <Badge size="md" variant="solid" borderRadius="$none" action="info">
                      <BadgeText>{data.campus.name}</BadgeText>
                    </Badge>
                    )
                  : (
                    <Pressable onPress={() => router.push('/user/certify')}>
                      <Badge size="md" variant="solid" borderRadius="$none" action="muted">
                        <BadgeText>未认证</BadgeText>
                      </Badge>
                    </Pressable>
                    )}
              </HStack>
            </VStack>
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
      <View pt={AVATAR_SIZE_VALUE / 2 + VERTICAL_SPACING + BANNER_BOTTOM_HEIGHT_ADDITION} bg={bgColor}>
        <View pt={AVATAR_SIZE_VALUE / 2} pointerEvents="none" bg={bgColor} />
        {/* 基本信息 */}
        <View px="$4" mb="$2">
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
            scrollEnabled
            indicatorStyle={{ backgroundColor: primaryColor }}
            labelStyle={{
              textAlign: 'center',
              paddingVertical: 4,
              color: textColor,
              width: (window.width - 4 * 2 * 3) / 3,
            }}
            activeColor={primaryColor}
            style={{ backgroundColor: bgColor }}
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
