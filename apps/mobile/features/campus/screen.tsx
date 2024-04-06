import type { Campus } from '@youni/database'
import { Tabs, useCurrentTabScrollY, useHeaderMeasurements } from 'react-native-collapsible-tab-view'
import { useState } from 'react'
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated'
import { Platform } from 'react-native'
import { DynamicList } from './components/DynamicList'
import { SelectCampusButton } from './components/SelectCampusButton'
import { useCurrentCampus } from '@/atoms/campus'
import { Image, SizableText, View, XStack, YStack, useTheme, useWindowDimensions } from '@/ui'
import { ImageCarousel } from '@/ui/components/ImageCarousel'
import { NavBar, useNavBarHeight } from '@/ui/components/NavBar'
import { trpc } from '@/utils/trpc'
import { useUser } from '@/utils/auth/hooks/useUser'
import { FullscreenSpinner } from '@/ui/components/FullscreenSpinner'

export function CampusScreen() {
  const theme = useTheme()
  const [currentCampus, setCurrentCampus] = useCurrentCampus()

  const { data, isLoading } = trpc.campus.byId.useQuery({ id: currentCampus.id }, {
    enabled: !!currentCampus.id,
  })

  const window = useWindowDimensions()
  const [headerHeight, setHeaderHeight] = useState(0)
  const navBarHeight = useNavBarHeight()
  const TAB_BAR_HEIGHT = 40
  const TAB_VIEW_MARGIN_TOP = -2
  const scrollY = useSharedValue<number>(0)

  const contentContainerStyle = {
    minHeight: window.height
    - navBarHeight
    + headerHeight
    + (Platform.OS === 'android' ? TAB_BAR_HEIGHT : 0)
    - TAB_VIEW_MARGIN_TOP,
    paddingTop: headerHeight ? headerHeight + TAB_BAR_HEIGHT : 0,
  }

  if (isLoading)
    return (<FullscreenSpinner />)

  const CampusHeader = () => {
    const Y = useCurrentTabScrollY()

    useAnimatedReaction(
      () => Y.value,
      (newValue) => {
        scrollY.value = newValue
      },
      [Y],
    )
    return (
      <>
        <ImageCarousel data={data?.carousels.map(image => image.src)} height={150} showProgress={false} />
        <GridNav />
      </>
    )
  }

  return (
    <YStack fullscreen flex={1} bg="$background">
      <NavBar
        left={(<CampusTitle campus={data as unknown as Campus}></CampusTitle>)}
        right={(<SelectCampusButton></SelectCampusButton>)}
        style={{
          zIndex: 100,
          backgroundColor: theme.$background?.get(),
        }}
      >
      </NavBar>

      <Tabs.Container
        allowHeaderOverscroll
        headerHeight={headerHeight}
        revealHeaderOnScroll={false}
        lazy
        snapThreshold={0.5}
        headerContainerStyle={{
          shadowOpacity: 0,
        }}
        renderHeader={(props) => {
          return (
            <View
              onLayout={ev => setHeaderHeight(ev.nativeEvent.layout.height)}
              pointerEvents="box-none"
            >
              <CampusHeader />
            </View>
          )
        }}
        renderTabBar={(props) => {
          // eslint-disable-next-line react/prop-types
          const { tabNames } = props
          return (
            <XStack
              {...props}
              h={TAB_BAR_HEIGHT}
              px="$3"
              py="$2"
              bg="$background"
            >
              <SizableText>
                {tabNames}
              </SizableText>
            </XStack>
          )
        }}
      >

        <Tabs.Tab name="动态广场">
          <DynamicList contentContainerStyle={contentContainerStyle} />
        </Tabs.Tab>
      </Tabs.Container>
    </YStack>
  )
}

function CampusTitle({ campus }: { campus?: Campus }) {
  if (!campus)
    return <SizableText>请选择校区</SizableText>

  return (
    <View flexDirection="row" gap="$2" ai="center">
      <Image
        w={24}
        h={24}
    // @ts-expect-error
        source={{ uri: campus.logo, width: '100%', height: '100%' }}
        resizeMode="contain"
      />
      {/* <School /> */}
      <SizableText fontSize={18}>{campus.name}</SizableText>
    </View>
  )
}

function GridNav() {
  const { currentUser } = useUser()
  const [currentCampus, setCurrentCampus] = useCurrentCampus()

  // TODO: 当所选校区与用户所在校区一致显示
  if (currentUser?.campusId === currentCampus.id) {
    return (
      <>
        {/* 我的课表 */}
        {/* 我的 GPA */}
        {/* 校区公众号 */}
      </>
    )
  }

  return <></>
}
