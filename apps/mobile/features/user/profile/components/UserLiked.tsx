import { Paragraph, Spinner, YStack } from "@/ui";
import { EmptyResult } from "@/ui/components/EmptyResult";
import { NoteList } from "@/ui/note/NoteList";
import { trpc } from "@/utils/trpc";
import { empty, error, loading, success } from "@/utils/trpc/patterns";
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
    .with(error, () => <EmptyResult message={userLikedNote.failureReason?.message} />)
    .with(loading, () => (
      <YStack fullscreen flex={1} justifyContent='center' alignItems='center' >
        <Paragraph paddingBottom='$3' > Loading...</Paragraph>
        < Spinner />
      </YStack>
    ))
    .with(empty, () => <Paragraph>没有更多数据 </Paragraph>)
    .with(success, () => (
      <NoteList
        data={userLikedNote.data?.pages.flatMap(page => page.items) as unknown as NoteItem[]}
        isRefetching={userLikedNote.isRefetching}
        onRefresh={() => userLikedNote.refetch()}
        onEndReached={() => userLikedNote.fetchNextPage()}
      />
    ))
    .otherwise(() => <EmptyResult message={userLikedNote.failureReason?.message} />)

  return (
    <YStack flex={1} backgroundColor={'$background'} >
      {userLikedNoteLayout}
    </YStack>
  )
}