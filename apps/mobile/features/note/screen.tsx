
import React, { lazy, useEffect } from 'react'
import { Link, useLocalSearchParams } from 'expo-router'
import { trpc } from '@/utils/trpc'
import { Text, H5, ImageCarousel, YStack, Paragraph, Separator, ScrollView, XStack } from '@/ui'
import { formatTime } from '@/utils/date'

import { NoteItem } from '@server/modules/note/note'

import { NoteHeader } from './NoteHeader'
import { NoteFooter } from './NoteFooter'
import { RefreshControl } from 'react-native-gesture-handler'
import { useCurrentNote } from '@/atoms/comment'
import { FullscreenSpinner } from '@/ui/components/FullscreenSpinner'
import NotFound from '@/ui/components/NotFound'

// @ts-ignore
const Comments = lazy(() => import('@/ui/components/comment/Comment'))

export const NoteScreen = (): React.ReactNode => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [_, setNote] = useCurrentNote()

  const { data, isLoading, isRefetching, refetch } = trpc.note.byId.useQuery({ id })

  useEffect(() => {
    if (data) {
      setNote(data as NoteItem)
    }
  }, [data, setNote])

  if (isLoading) {
    return <FullscreenSpinner />
  }

  if (!data) return <>
    {/* TODO: REDIRECT to empty screen */}
    <NotFound title="笔记不见了哦" />
  </>

  return <>
    <YStack fullscreen backgroundColor={'$background'}>
      <NoteHeader user={data.user} />
      <ScrollView
        position='relative'
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <ImageCarousel data={data?.images.map((image) => image.src)} />

        <YStack paddingHorizontal='$3' marginTop="$3" gap='$2'>
          <H5>{data?.title}</H5>

          <Paragraph size="$2">
            {data?.content}
          </Paragraph>

          <XStack gap='$2'>
            {
              data?.tags.map((tag) => {
                <Link href={`/tag/${tag.id}`} asChild>
                  <Text>#{tag.name}</Text>
                </Link>
              })
            }
          </XStack>

          <Text fontSize='$1' color={'gray'}>
            {formatTime(data?.publishTime)}
          </Text>

          <Separator marginVertical={15} />

          <Text fontSize='$3' color={'gray'}>
            共 {data.interact.commentCount} 条评论
          </Text>

          <Comments />
        </YStack>
      </ScrollView>
      <NoteFooter item={data as unknown as NoteItem} />
    </YStack>
  </>
}

