import React, { lazy, useEffect } from 'react'
import { Link, useLocalSearchParams } from 'expo-router'
import type { NoteItem } from '@server/modules/note/note'
import { RefreshControl } from 'react-native-gesture-handler'
import { NoteHeader } from './NoteHeader'
import { NoteFooter } from './NoteFooter'
import { trpc } from '@/utils/trpc'
import { H5, ImageCarousel, Paragraph, ScrollView, Separator, Text, XStack, YStack } from '@/ui'
import { formatTime } from '@/utils/date'

import { useCurrentNote } from '@/atoms/comment'
import { FullscreenSpinner } from '@/ui/components/FullscreenSpinner'
import NotFound from '@/ui/components/NotFound'

// @ts-expect-error
const Comments = lazy(() => import('@/ui/components/comment/Comment'))

export function NoteScreen(): React.ReactNode {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [_, setNote] = useCurrentNote()

  const { data, isLoading, isRefetching, refetch } = trpc.note.byId.useQuery({ id })

  useEffect(() => {
    if (data)
      setNote(data as NoteItem)
  }, [data, setNote])

  if (isLoading)
    return <FullscreenSpinner />

  if (!data) {
    return (
      <>
        {/* TODO: REDIRECT to empty screen */}
        <NotFound title="笔记不见了哦" />
      </>
    )
  }

  return (
    <>
      <YStack fullscreen bg="$background">
        <NoteHeader item={data as NoteItem} user={data.user} />
        <ScrollView
          position="relative"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          <ImageCarousel data={data?.images.map(image => image.src)} />

          <YStack px="$3" mt="$3" gap="$2">
            <H5>{data?.title}</H5>

            <Paragraph size="$2">
              {data?.content}
            </Paragraph>

            <XStack rowGap="$1" columnGap="$2" flexWrap="wrap" mb="$4">
              {data?.tags.map(tag => (
                <Link key={tag.name} href={`/tag/${tag.name}`} asChild>
                  <Text color="$blue8">
                    {`# ${tag.name}`}
                  </Text>
                </Link>
              ),
              )}
            </XStack>

            <Text fontSize="$1" color="gray">
              {formatTime(data?.publishTime)}
            </Text>

            <Separator my={15} />

            <Text fontSize="$3" color="gray">
              共
              {' '}
              {data.interact.commentCount}
              {' '}
              条评论
            </Text>

            <Comments />
          </YStack>
        </ScrollView>
        <NoteFooter item={data as unknown as NoteItem} />
      </YStack>
    </>
  )
}
