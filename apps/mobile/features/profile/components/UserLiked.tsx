import { Paragraph, Spinner, YStack } from "@/ui";
import { EmptyResult } from "@/ui/components/EmptyResult";
import { NoteList } from "@/ui/note/NoteList";
import { trpc } from "@/utils/trpc";
import { empty, error, loading, success } from "@/utils/trpc/patterns";
import { match } from "ts-pattern";

interface Props {
  userId: string
}

export const UserLiked = ({ userId }: Props) => {
  const userCollection = trpc.note.userLikedNotes.useInfiniteQuery(
    {
      userId,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.startCursor,
    }
  );

  const userCollectionLayout = match(userCollection)
    .with(error, () => <EmptyResult message={userCollection.failureReason?.message} />)
    .with(loading, () => (
      <YStack fullscreen flex={1} justifyContent='center' alignItems='center' >
        <Paragraph paddingBottom='$3' > Loading...</Paragraph>
        < Spinner />
      </YStack>
    ))
    .with(empty, () => <Paragraph>没有更多数据 </Paragraph>)
    .with(success, () => (
      <NoteList data={userCollection.data?.pages[0]?.items as any[]} isLoading={userCollection.isFetching} />
    ))
    .otherwise(() => <EmptyResult message={userCollection.failureReason?.message} />)

  return (
    <YStack flex={1} backgroundColor={'$background'} >
      {userCollectionLayout}
    </YStack>
  )
}