import Carousel from 'react-native-reanimated-carousel'
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { useWindowDimensions } from 'react-native'
import { HStack, Image, View, useToken } from '@gluestack-ui/themed'
import { window } from '@/constant/window'

interface Props {
  data: string[]
  width?: number
  height?: number
  showProgress?: boolean
}

export function ImageCarousel({ data, width, height, showProgress = true }: Props): React.ReactNode {
  const progressValue = useSharedValue<number>(0)
  const { width: windowWidth } = useWindowDimensions()

  const imageWidth = width ?? windowWidth
  const imageHeight = height ?? window.width / 2

  return (
    <>
      <Carousel
        width={imageWidth}
        height={imageHeight}
        style={{
          width: '100%',
        }}
        loop={false}
        pagingEnabled={false}
        overscrollEnabled={false}
        autoPlay={false}
        onProgressChange={(_, absoluteProgress) => (progressValue.value = absoluteProgress)}
        data={data}
        renderItem={({ item }) => (
          <Image
            w={imageWidth}
            h={imageHeight}
            source={{ uri: item }}
            resizeMode="center"
            alt="image"
          />
        )}
      />
      {!!progressValue && showProgress && (
        <HStack m="$2" justifyContent="center" gap="$2">
          {data?.map((_, index) => {
            return (
              <PaginationItem
                backgroundColor="gray"
                animValue={progressValue}
                index={index}
                key={index}
                isRotate={false}
                length={data.length}
              />
            )
          })}
        </HStack>
      )}
    </>
  )
}

function PaginationItem(
  {
    animValue,
    index,
    length,
    backgroundColor,
    isRotate,
  }: {
    index: number
    backgroundColor: string
    length: number
    animValue: Animated.SharedValue<number>
    isRotate?: boolean
  },
) {
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
            Extrapolation.CLAMP,
          ),
        },
      ],
    }
  }, [animValue, index, length])

  return (
    <View
      bg="$backgroundLight300"
      $dark-bg="backgroundLight800"
      width={width}
      height={width}
      borderRadius="$full"
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
