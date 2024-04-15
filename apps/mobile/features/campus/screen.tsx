import type { Campus } from '@youni/database'
import { Tabs, useCurrentTabScrollY } from 'react-native-collapsible-tab-view'
import { useState } from 'react'
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated'
import { Platform } from 'react-native'
import { DynamicList } from './components/DynamicList'
import { SelectCampusButton } from './components/SelectCampusButton'
import { useCurrentCampus } from '@/atoms/campus'
import { Image, Text, View, useTheme, useWindowDimensions } from '@/ui'
import { ImageCarousel } from '@/ui/components/ImageCarousel'
import { NavBar, useNavBarHeight } from '@/ui/components/NavBar'
import { trpc } from '@/utils/trpc'
import { useAuth } from '@/utils/auth'
import { FullscreenSpinner } from '@/ui/components/FullscreenSpinner'

export function CampusScreen() {
  const [currentCampus, setCurrentCampus] = useCurrentCampus()

  const { data, isLoading } = trpc.campus.byId.useQuery({ id: currentCampus.id }, {
    enabled: !!currentCampus.id,
  })

  // useEffect(() => {
  //   setCurrentCampus({
  //     id: '35618370883588004',
  //   })
  // }, [])

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
    <View className="flex-1 bg-background">
      <NavBar
        left={(<CampusTitle campus={data as unknown as Campus}></CampusTitle>)}
        right={(<SelectCampusButton></SelectCampusButton>)}
        className="z-1 bg-background"
      >
      </NavBar>

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
            <CampusHeader />
          </View>
        )}
        renderTabBar={(props) => {
          // eslint-disable-next-line react/prop-types
          const { tabNames } = props
          return (
            <View
              {...props}
              className="h-[${TAB_BAR_HEIGHT}px] p-3 py-2 bg-background"
            >
              <Text>{tabNames}</Text>
            </View>
          )
        }}
      >

        <Tabs.Tab name="动态广场">
          <DynamicList contentContainerStyle={contentContainerStyle} />
        </Tabs.Tab>
      </Tabs.Container>
    </View>
  )
}

function CampusTitle({ campus }: { campus?: Campus }) {
  if (!campus)
    return <Text>请选择校区</Text>

  return (
    <View className="flex-row items-center gap-2">
      <Image
        w={24}
        h={24}
        // @ts-expect-error
        source={{ uri: campus.logo, width: '100%', height: '100%' }}
        resizeMode="contain"
      />
      {/* <School /> */}
      <Text className="text-lg">{campus.name}</Text>
    </View>
  )
}

function GridNav() {
  const { currentUser } = useAuth()
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
