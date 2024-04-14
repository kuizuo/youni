import React, { lazy, useEffect } from 'react'
import { Link, useLocalSearchParams } from 'expo-router'
import type { NoteItem } from '@server/modules/note/note'
import { RefreshControl } from 'react-native-gesture-handler'
import { NoteHeader } from './components/NoteHeader'
import { NoteFooter } from './components/NoteFooter'
import { NoteDetailPlaceholder } from './components/NoteDetailPlaceholder'
import { trpc } from '@/utils/trpc'
import { H5, Paragraph, ScrollView, Separator, Text, View, XStack } from '@/ui'
import { formatTime } from '@/utils/date'

import { useCurrentNote } from '@/atoms/comment'
import { NotFound } from '@/ui/components/NotFound'
import { ImageCarousel } from '@/ui/components/ImageCarousel'

// @ts-expect-error
const Comments = lazy(() => import('@/ui/components/comment/Comment'))

export function NoteScreen(): React.ReactNode {
  const { id } = useLocalSearchParams<{ id: string, title: string, username: string, avatar: string }>()
  const [_, setCurrentNote] = useCurrentNote()

  const { data, isLoading, isRefetching, refetch } = trpc.note.byId.useQuery({ id })

  useEffect(() => {
    if (data)
      setCurrentNote(data as NoteItem)
  }, [data, setCurrentNote])

  if (isLoading)
    return <></>
  // return <NoteDetailPlaceholder></NoteDetailPlaceholder>

  if (!data) {
    return (
      <>
        {/* TODO: REDIRECT to empty screen */}
        <NotFound title="笔记不见了哦" />
      </>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <NoteHeader item={data as NoteItem} user={data.user} />
      <ScrollView
        position="relative"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <ImageCarousel data={data?.images.map(image => image.src)} />

        <View className="px-3 mt-3 gap-2">
          <H5>{data?.title}</H5>

          <Paragraph size="$2">
            {data?.content}
          </Paragraph>

          <View className="flex-row mb-4 flex-warp gap-x-1 gap-y-2 ">
            {data?.tags.map(tag => (
              <Link key={tag.name} href={`/tag/${tag.name}`} asChild>
                <Text color="$blue8">
                  {`# ${tag.name}`}
                </Text>
              </Link>
            ),
            )}
          </View>

          <Text fontSize="$1" color="gray">
            {formatTime(data?.publishTime)}
          </Text>

          <Separator my={15} />

          <Text fontSize="$3" color="gray">
            {`共 ${data.interact.commentCount} 条评论`}
          </Text>

          <Comments />
        </View>
      </ScrollView>
      <NoteFooter item={data as unknown as NoteItem} />
    </View>
  )
}
