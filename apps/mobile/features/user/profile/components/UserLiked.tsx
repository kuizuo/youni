import { Paragraph, Spinner, YStack, Image } from "@/ui";
import { EmptyResult } from "@/ui/components/EmptyResult";
import { NoteList } from "@/ui/components/note/NoteList";
import { trpc } from "@/utils/trpc";
import { error, infiniteEmpty, loading, success } from "@/utils/trpc/patterns";
import { NoteItem } from "@server/modules/note/note";
import { match } from "ts-pattern";

interface Props {
  userId: string
}

export const UserLiked = ({ userId }: Props) => {
  const userLikedNote = trpc.note.userLikedNotes.useInfiniteQuery(
    {
      userId,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
    }
  );

  const userLikedNoteLayout = match(userLikedNote)
    .with(error, () => <EmptyResult title={userLikedNote.failureReason?.message} />)
    .with(loading, () => (
      <YStack fullscreen flex={1} justifyContent='center' alignItems='center' >
        <Paragraph paddingBottom='$3' > Loading...</Paragraph>
        < Spinner />
      </YStack>
    ))
    .with(infiniteEmpty, () => (
      <EmptyResult
        image={<Image width={60} height={60} tintColor={'gray'} source={require('@/assets/images/unlike.png')} />}
        title='还没有赞过笔记哦'
      />
    ))
    .with(success, () => (
      <NoteList
        data={userLikedNote.data?.pages.flatMap(page => page.items) as unknown as NoteItem[]}
        isRefreshing={userLikedNote.isRefetching}
        onRefresh={() => userLikedNote.refetch()}
        onEndReached={() => userLikedNote.fetchNextPage()}
      />
    ))
    .otherwise(() => <EmptyResult title={userLikedNote.failureReason?.message} />)

  return (
    <YStack flex={1} backgroundColor={'$background'} >
      {userLikedNoteLayout}
    </YStack>
  )
}