
import { Paragraph, Spinner, YStack, Image } from "@/ui";
import { EmptyResult } from "@/ui/components/EmptyResult";
import { NoteList } from "@/ui/components/note/NoteList";
import { useUser } from "@/utils/auth/hooks/useUser";
import { trpc } from "@/utils/trpc";
import { error, infiniteEmpty, loading, success } from "@/utils/trpc/patterns";
import { NoteItem } from "@server/modules/note/note";
import { match } from "ts-pattern";

interface Props {
  userId: string
}

export const UserCollection = ({ userId }: Props) => {
  const { currentUser } = useUser()

  const userCollection = trpc.note.userCollectNotes.useInfiniteQuery(
    {
      userId,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.endCursor,
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
    .with(infiniteEmpty, () => (
      <EmptyResult
        image={<Image width={60} height={60} tintColor={'gray'} source={require('@/assets/images/notes.png')} />}
        message={`${currentUser?.id === userId ? '你' : '他'}还没有收藏任何笔记哦`}
      />
    ))
    .with(success, () => (
      <NoteList
        data={userCollection.data?.pages.flatMap(page => page.items) as unknown as NoteItem[]}
        isRefetching={userCollection.isRefetching}
        onRefresh={() => userCollection.refetch()}
        onEndReached={() => userCollection.fetchNextPage()}
      />
    ))
    .otherwise(() => <EmptyResult message={userCollection.failureReason?.message} />)

  return (
    <YStack flex={1} backgroundColor={'$background'} >
      {userCollectionLayout}
    </YStack>
  )
}