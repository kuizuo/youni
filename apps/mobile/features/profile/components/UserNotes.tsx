import { Paragraph, Spinner, YStack } from "@/ui";
import { EmptyResult } from "@/ui/components/EmptyResult";
import { NoteList } from "@/ui/note/NoteList";
import { trpc } from "@/utils/trpc";
import { empty, error, loading, success } from "@/utils/trpc/patterns";
import { match } from "ts-pattern";

export const UserNotes = ({ userId }: { userId: string }) => {
  const userNotes = trpc.note.userNotes.useInfiniteQuery(
    {
      userId: userId,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.startCursor,
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
      <NoteList data={userNotes.data?.pages[0]?.items as any[]} isLoading={userNotes.isFetching} />
    ))
    .otherwise(() => <EmptyResult message={userNotes.failureReason?.message} />)

  return (
    <YStack flex={1} backgroundColor={'$background'} >
      {userNotesLayout}
    </YStack>
  )
}