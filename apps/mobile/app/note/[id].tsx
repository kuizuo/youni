import React, { lazy } from 'react';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { trpc } from '@/utils/trpc';
import { Avatar, Text, XStack, H5, ImageCarousel, YStack, Paragraph, View, Separator, ScrollView, Input } from '@/ui';
import { formatTime } from '@/utils/date';
import { NoteCollectButton } from '@/ui/note/NoteCollectButton';
import { NoteLikeButton } from '@/ui/note/NoteLikeButton';
import { InteractedNote } from '@server/modules/note/note';

// @ts-ignore
const Comments = lazy(() => import('@/ui/comment/Comment'));

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data } = trpc.note.byId.useQuery({ id })

  if (!data) return <></>;

  return <View flex={1}>
    <Stack.Screen options={{
      headerShown: true,
      headerTitle: () => <>
        <Link href={`/user/${data?.user.id}/profile`} asChild>
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
        <NoteLikeButton item={data as unknown as InteractedNote} />
        <NoteCollectButton item={data as unknown as InteractedNote} />
        <CommentButton></CommentButton>
      </XStack>
    </XStack>
  </View>
}

const CommentButton = () => {
  return <>
  </>
}