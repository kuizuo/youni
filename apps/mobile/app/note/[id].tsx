import React, { lazy } from 'react';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { trpc } from '@/utils/trpc';
import { Avatar, Text, XStack, H5, ImageCarousel, YStack, Paragraph, View, Separator, ScrollView, Input } from '@/ui';
import { formatTime } from '@/utils/date';
import { NoteLikeButton, NoteCollectButton } from '@/ui/components/Button';

// @ts-ignore
const Comments = lazy(() => import('@/ui/components/Comment'));

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data } = trpc.note.byId.useQuery({ id })

  if (!data) return <></>;

  return <View flex={1}>
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
    <ScrollView position='relative'>
      <ImageCarousel data={data?.imageList!} />

      <YStack paddingHorizontal='$3' marginTop="$3" gap='$2'>
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
          {formatTime(data?.updatedAt)}
        </Text>

        <Separator marginVertical={15} />

        <Text fontSize='$3' color={'gray'}>
          共 {data.interactInfo.commentCount} 条评论
        </Text>

        <Comments itemId={id} itemType={'Note'}></Comments>
      </YStack>
    </ScrollView>
    <XStack borderTopWidth={1} borderColor={'$gray8'} padding='$2.5' gap="$2">
      <Input flex={1} size="$2" placeholder={`说点什么`} />
      <XStack gap='$2'>
        <NoteLikeButton liked={data.interactInfo.liked} likeCount={data.interactInfo.likeCount} itemId={data.id} />
        <NoteCollectButton collected={data.interactInfo.collected} collectCount={data.interactInfo.collectedCount} itemId={data.id} />
        <CommentButton></CommentButton>
      </XStack>
    </XStack>
  </View>
}

const CommentButton = () => {
  return <>
  </>
}