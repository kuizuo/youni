import type { Campus } from '@youni/database'
import Animated, { useSharedValue } from 'react-native-reanimated'
import { DynamicList } from './components/DynamicList'
import { SelectCampusButton } from './components/SelectCampusButton'
import { useCurrentCampus } from '@/atoms/campus'
import { Image, SizableText, View, XStack, YStack } from '@/ui'
import { ImageCarousel } from '@/ui/components/ImageCarousel'
import { NavBar } from '@/ui/components/NavBar'
import { trpc } from '@/utils/trpc'
import { useUser } from '@/utils/auth/hooks/useUser'
import { FullscreenSpinner } from '@/ui/components/FullscreenSpinner'

export function CampusScreen() {
  const [currentCampus, setCurrentCampus] = useCurrentCampus()

  const { data, isLoading } = trpc.campus.byId.useQuery({ id: currentCampus.id }, {
    enabled: !!currentCampus.id,

  })

  const scrollY = useSharedValue<number>(0)

  if (isLoading)
    return (<FullscreenSpinner />)

  return (
    <YStack fullscreen flex={1} bg="$background">
      <NavBar
        left={(
          <CampusTitle campus={data as unknown as Campus}></CampusTitle>)}
        right={(
          <SelectCampusButton></SelectCampusButton>
        )}
      >
      </NavBar>

      <View mx="$1">
        <ImageCarousel data={data?.carousels.map(image => image.src)} height={150} showProgress={false} />
      </View>
      <GridNav />

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