import React, { lazy, useEffect } from 'react'
import { Link, useLocalSearchParams } from 'expo-router'
import type { NoteItem } from '@server/modules/note/note'
import { RefreshControl } from 'react-native-gesture-handler'
import { Divider, HStack, Heading, LinkText, ScrollView, Text, View } from '@gluestack-ui/themed'
import { NoteHeader } from './components/NoteHeader'
import { NoteFooter } from './components/NoteFooter'
import { NoteDetailPlaceholder } from './components/NoteDetailPlaceholder'
import { trpc } from '@/utils/trpc'
import { formatTime } from '@/utils/date'

import { useCurrentNote } from '@/atoms/comment'
import { NotFound } from '@/ui/components/NotFound'
import { ImageCarousel } from '@/ui/components/ImageCarousel'

// import { Comments } from '@/ui/components/comment/Comments'

// @ts-expect-error
const Comments = lazy(() => import('@/ui/components/comment/Comments'))

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
    <View flex={1} position="relative">
      <NoteHeader item={data as NoteItem} user={data.user} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <ImageCarousel data={data?.images.map(image => image.src)} />

        <View px="$3" mt="$3" gap="$2">
          <Heading size="md">{data?.title}</Heading>

          <Text size="sm">
            {data?.content}
          </Text>

          <HStack flexWrap="wrap" rowGap="$1" columnGap="$2">
            {data?.tags.map(tag => (
              <Link key={tag.name} href={`/tag/${tag.name}`} asChild>
                <LinkText>
                  {`# ${tag.name}`}
                </LinkText>
              </Link>
            ),
            )}
          </HStack>

          <Text size="sm" color="$secondary500">
            {formatTime(data?.publishTime)}
          </Text>

          <Divider my={15} />

          <Comments />
        </View>
      </ScrollView>
      <NoteFooter item={data as unknown as NoteItem} />
    </View>
  )
}
