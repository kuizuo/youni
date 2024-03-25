import Carousel from 'react-native-reanimated-carousel'
import Animated, { Extrapolate, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { Image, View, useWindowDimensions } from '@/ui'
import { window } from '@/constant'

interface Props {
  data: string[]
  width?: number
  height?: number
}

export function ImageCarousel({ data, width, height }: Props): React.ReactNode {
  const progressValue = useSharedValue<number>(0)
  const { width: windowWidth } = useWindowDimensions()

  return (
    <>
      <Carousel
        width={width ?? windowWidth}
        height={height ?? window.width / 2}
        style={{ width: '100%' }}
        loop={false}
        pagingEnabled={false}
        overscrollEnabled={false}
        autoPlay={false}
        onProgressChange={(_, absoluteProgress) =>
          (progressValue.value = absoluteProgress)}
        data={data}
        renderItem={({ item }) => (
          <Image
          // @ts-expect-error
            source={{ uri: item, width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        )}
      />
      {!!progressValue && (
        <View
          fd="row"
          jc="center"
          paddingTop="$2"
          gap="$1.5"
        >
          {data?.map((_, index) => {
            return (
              <PaginationItem
                bg="gray"
                animValue={progressValue}
                index={index}
                key={index}
                isRotate={false}
                length={data.length}
              />
            )
          })}
        </View>
      )}
    </>
  )
}

const PaginationItem: React.FC<{
  index: number
  backgroundColor: string
  length: number
  animValue: Animated.SharedValue<number>
  isRotate?: boolean
}> = (props) => {
  const { animValue, index, length, backgroundColor, isRotate } = props
  const width = 8

  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1]
    let outputRange = [-width, 0, width]

    if (index === 0 && animValue?.value > length - 1) {
      inputRange = [length - 1, length, length + 1]
      outputRange = [-width, 0, width]
    }

    return {
      transform: [
        {
          translateX: interpolate(
            animValue?.value,
            inputRange,
            outputRange,
            Extrapolate.CLAMP,
          ),
        },
      ],
    }
  }, [animValue, index, length])

  return (
    <View
      bg="$gray7"
      width={width}
      height={width}
      br={50}
      overflow="hidden"
      style={{
        transform: [
          {
            rotateZ: isRotate ? '90deg' : '0deg',
          },
        ],
      }}
    >
      <Animated.View
        style={[
          {
            borderRadius: 50,
            backgroundColor,
            flex: 1,
          },
          animStyle,
        ]}
      />
    </View>
  )
}
