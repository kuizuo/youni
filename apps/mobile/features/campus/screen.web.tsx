import type { Campus } from '@youni/database'
import { useState } from 'react'
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated'
import { Platform, useColorScheme, useWindowDimensions } from 'react-native'
import { Image, Text, View, useToken } from '@gluestack-ui/themed'
import { DynamicList } from './components/DynamicList'
import { SelectCampusButton } from './components/SelectCampusButton'
import { GridNav } from './components/GridNav'
import { CampusTitle } from './components/CampusTitle'
import { useCurrentCampus } from '@/atoms/campus'
import { ImageCarousel } from '@/ui/components/ImageCarousel'
import { NavBar, useNavBarHeight } from '@/ui/components/NavBar'
import { trpc } from '@/utils/trpc'
import { FullscreenSpinner } from '@/ui/components/FullscreenSpinner'

export function CampusScreen() {
  const [currentCampus, setCurrentCampus] = useCurrentCampus()

  const { data, isLoading } = trpc.campus.byId.useQuery({ id: currentCampus?.id }, {
    enabled: !!currentCampus?.id,
  })

  const colorScheme = useColorScheme()
  const bgColor = useToken('colors', colorScheme === 'dark' ? 'backgroundDark950' : 'backgroundLight0')

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
    return (
      <>
        {data?.carousels.length > 0 && (
          <ImageCarousel
            data={data?.carousels.map(image => image.src)}
            height={150}
            showProgress={false}
          />
        )}
        <GridNav />
      </>
    )
  }

  return (
    <View
      flex={1}
      bg="$backgroundLight0"
      $dark-bg="$backgroundDark950"
    >
      <NavBar
        left={(<CampusTitle campus={data as unknown as Campus}></CampusTitle>)}
        right={(<SelectCampusButton></SelectCampusButton>)}
        style={{ zIndex: 1, backgroundColor: bgColor }}
      >
      </NavBar>
      {
        currentCampus?.id
          ? (
            <>
              <CampusHeader />
              <DynamicList contentContainerStyle={contentContainerStyle} />
            </>
            )
          : <></>
      }
    </View>
  )
}
