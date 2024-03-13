import React, { ElementRef, lazy, useRef, useState } from 'react';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { trpc } from '@/utils/trpc';
import { Avatar, Text, XStack, H5, ImageCarousel, YStack, Paragraph, View, Separator, ScrollView, Input } from '@/ui';
import { formatTime } from '@/utils/date';
import { NoteCollectButton } from '@/ui/note/NoteCollectButton';
import { NoteLikeButton } from '@/ui/note/NoteLikeButton';
import { NoteItem } from '@server/modules/note/note';
import { FollowButton } from '@/ui/user/FollowButton';
import { CommentRefType } from '@server/modules/comment/comment.constant';
import { useUser } from '@/utils/auth/hooks/useUser';
import { CommentSheet } from '@/ui/comment/CommentSheet';

// @ts-ignore
const Comments = lazy(() => import('@/ui/comment/Comment'));

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { profile } = useUser()
  const { data } = trpc.note.byId.useQuery({ id })

  const { data: isFollowing, isLoading } = trpc.interact.isFollowing.useQuery({ id: data?.user.id! }, { enabled: !!data })

  if (!data) return <>
    {/* TODO: REDIRECT to empty screen */}
    <Text>
      笔记不见了哦
    </Text>
  </>;

  return <View flex={1}>
    <Stack.Screen options={{
      headerShown: true,
      headerTitle: () => <>
        <Link href={`/user/${data.user.id}/profile`} asChild>
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
      headerRight: () => isLoading || profile?.id === data.user?.id ? <></> : <FollowButton userId={data?.user.id} isFollowing={isFollowing!} />,
      headerShadowVisible: false,
    }} />
    <ScrollView position='relative'>
      <ImageCarousel data={data?.images.map((image) => image.src)} />

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
          {formatTime(data?.publishTime)}
        </Text>

        <Separator marginVertical={15} />

        <Text fontSize='$3' color={'gray'}>
          共 {data.interact.commentCount} 条评论
        </Text>

        <Comments itemId={id} itemType={'Note'} authorId={data.user.id}></Comments>
      </YStack>
    </ScrollView>
    <NoteBottom item={data as unknown as NoteItem}></NoteBottom>
  </View>
}

const NoteBottom = ({ item }: { item: NoteItem }) => {
  const { mutateAsync: comment } = trpc.comment.create.useMutation()

  const inputRef = useRef<ElementRef<typeof Input>>(null)
  const [content, setContent] = useState('')
  const handleComment = async () => {
    if (!content) {
      return
    }

    await comment({ content, itemId: item.id, itemType: CommentRefType.Note })
    setContent('')
    inputRef.current!.clear()
  }

  return <XStack borderTopWidth={1} borderColor={'$gray8'} padding='$2.5' gap="$2">
    <Input ref={inputRef}
      flex={1} size="$2"
      placeholder={``}
      onChangeText={newText => setContent(newText)}
      onSubmitEditing={handleComment}
    />
    <XStack gap='$2'>
      <NoteLikeButton item={item} />
      <NoteCollectButton item={item} />
    </XStack>
    <CommentSheet item={item}></CommentSheet>
  </XStack>
}