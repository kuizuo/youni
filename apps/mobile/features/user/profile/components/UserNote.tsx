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

export const UserNote = ({ userId }: Props) => {
  const { currentUser } = useUser()
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
    .with(infiniteEmpty, () => (
      <EmptyResult
        image={<Image width={60} height={60} tintColor={'gray'} source={require('@/assets/images/pic-one.png')} />}
        message={currentUser?.id === userId ? '快去创建笔记吧' : '他还没有发布笔记哦'}
      />))
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