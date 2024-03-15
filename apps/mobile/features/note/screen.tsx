
import React, { ElementRef, lazy, useRef, useState } from 'react'
import { Link, Stack, useLocalSearchParams } from 'expo-router'
import { trpc } from '@/utils/trpc'
import { Avatar, Text, XStack, H5, ImageCarousel, YStack, Paragraph, View, Separator, ScrollView, Input } from '@/ui'
import { formatTime } from '@/utils/date'

import { NoteItem } from '@server/modules/note/note'

import { NoteHeader } from './NoteHeader'
import { NoteFooter } from './NoteFooter'

// @ts-ignore
const Comments = lazy(() => import('@/ui/components/comment/Comment'))

export const NoteScreen = (): React.ReactNode => {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data } = trpc.note.byId.useQuery({ id })

  if (!data) return <>
    {/* TODO: REDIRECT to empty screen */}
    <Text>
      笔记不见了哦
    </Text>
  </>

  return <YStack fullscreen backgroundColor={'$background'}>
    <NoteHeader user={data.user} />
    <ScrollView position='relative' showsVerticalScrollIndicator={false} >
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
    <NoteFooter item={data as unknown as NoteItem} />
  </YStack>
}

