import React from 'react';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trpc } from '@/utils/trpc';
import { Avatar, Image, Text, XStack, View } from '@/ui';
import Carousel from "react-native-reanimated-carousel";

import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { window } from '@/constant'
import { useWindowDimensions } from 'react-native';

const PAGE_WIDTH = window.width


export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data } = trpc.note.byId.useQuery({ id })

  const windowWidth = useWindowDimensions().width;
  const progressValue = useSharedValue<number>(0);

  const imageLength = data?.imageList.length ?? 0;

  return <>
    <Stack.Screen options={{
      headerShown: true,
      headerTitle: () => <>
        <Link href={`/user/${data?.user.id}`} asChild>
          <XStack gap='$2.5' alignItems='center' marginBottom={0}>
            <Avatar circular size="$2">
              <Avatar.Image
                // @ts-ignore
                source={{
                  uri: data?.user.avatar!,
                  width: '100%',
                  height: '100%',
                }}
              />
              <Avatar.Fallback />
            </Avatar>
            <Text fontSize={14} opacity={0.7} >
              {data?.user.nickname}
            </Text>
          </XStack>
        </Link>
      </>,
      headerShadowVisible: false,
    }} />
    <Carousel
      width={windowWidth}
      height={PAGE_WIDTH / 2}
      loop={false}
      overscrollEnabled={false}
      autoPlay={false}
      onProgressChange={(_, absoluteProgress) =>
        (progressValue.value = absoluteProgress)
      }
      data={data?.imageList!}
      renderItem={({ item }) => (
        <Image
          // @ts-ignore
          source={{ uri: item, width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      )}
    />
    {!!progressValue && (
      <View
        flexDirection='row'
        justifyContent='center'
      >
        {data?.imageList.map((_, index) => {
          return (
            <PaginationItem
              backgroundColor={'gray'}
              animValue={progressValue}
              index={index}
              key={index}
              isRotate={false}
              length={imageLength}
            />
          );
        })}
      </View>
    )}
    <Text>Note : {id}</Text>
  </>;
}

const PaginationItem: React.FC<{
  index: number
  backgroundColor: string
  length: number
  animValue: Animated.SharedValue<number>
  isRotate?: boolean
}> = (props) => {
  const { animValue, index, length, backgroundColor, isRotate } = props;
  const width = 10;

  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1];
    let outputRange = [-width, 0, width];

    if (index === 0 && animValue?.value > length - 1) {
      inputRange = [length - 1, length, length + 1];
      outputRange = [-width, 0, width];
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
    };
  }, [animValue, index, length]);

  return (
    <View
      backgroundColor={'$background'}
      width={width}
      height={width}
      borderRadius={50}
      overflow='hidden'
      style={{
        transform: [
          {
            rotateZ: isRotate ? "90deg" : "0deg",
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
  );
};