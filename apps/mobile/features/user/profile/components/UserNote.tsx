import { Paragraph, Spinner, YStack } from "@/ui";
import { EmptyResult } from "@/ui/components/EmptyResult";
import { NoteList } from "@/ui/components/note/NoteList";
import { trpc } from "@/utils/trpc";
import { empty, error, loading, success } from "@/utils/trpc/patterns";
import { NoteItem } from "@server/modules/note/note";
import { match } from "ts-pattern";

interface Props {
  userId: string
}

export const UserNote = ({ userId }: Props) => {
  const userNotes = trpc.note.userNotes.useInfiniteQuery(
    {
      userId,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
    }
  );

  const userNotesLayout = match(userNotes)
    .with(error, () => <EmptyResult message={userNotes.failureReason?.message} />)
    .with(loading, () => (
      <YStack fullscreen flex={1} justifyContent='center' alignItems='center' >
        <Paragraph paddingBottom='$3' > Loading...</Paragraph>
        < Spinner />
      </YStack>
    ))
    .with(empty, () => <Paragraph>没有更多数据 </Paragraph>)
    .with(success, () => (
      <NoteList
        data={userNotes.data?.pages.flatMap(page => page.items) as unknown as NoteItem[]}
        isRefetching={userNotes.isRefetching}
        onRefresh={() => userNotes.refetch()}
        onEndReached={() => userNotes.fetchNextPage()}
      />
    ))
    .otherwise(() => <EmptyResult message={userNotes.failureReason?.message} />)

  return (
    <YStack flex={1} backgroundColor={'$background'} >
      {userNotesLayout}
    </YStack>
  )
}