import React from 'react';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { trpc } from '@/utils/trpc';
import { Avatar, Image, Text, XStack, H5, ImageCarousel, YStack, Paragraph, View, Separator } from '@/ui';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data } = trpc.note.byId.useQuery({ id })

  return <View>
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

    <ImageCarousel data={data?.imageList!} />

    <YStack paddingHorizontal='$3' marginTop="$3" gap='$2' >
      <H5>{data?.title}</H5>

      <Paragraph size="$2">
        {data?.content}
      </Paragraph>

      <View flexDirection='row' gap='$2'>
        {
          data?.tags.map((tag) => {
            <Link href={`/tag/${tag.id}`} asChild>
              <Text>#{tag.name}</Text>
            </Link>
          })
        }
      </View>

      <Text fontSize='$1' color={'gray'}>
        // TODO: add time info and local
      </Text>

      <Separator marginVertical={15} />

      <CommentList></CommentList>
    </YStack>
  </View>;
}

const CommentList = () => {
  // TODO: 
  return <></>
}