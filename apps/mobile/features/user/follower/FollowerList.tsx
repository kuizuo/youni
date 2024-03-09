import { Paragraph, Spinner, YStack, Text } from "@/ui";
import { EmptyResult } from "@/ui/components/EmptyResult";
import { UserList } from "@/ui/user/UserList";
import { trpc } from "@/utils/trpc";
import { empty, error, loading, success } from "@/utils/trpc/patterns";
import { match } from "ts-pattern";

interface Props {
  userId: string
  type: 'following' | 'followers'
}

export const FollowerList = ({ userId, type }: Props) => {
  const userList = trpc.interact[type].useInfiniteQuery(
    {
      id: userId,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.meta.hasNextPage && lastPage.meta.startCursor,
    }
  );

  const userListLayout = match(userList)
    .with(error, () => <EmptyResult message={userList.failureReason?.message} />)
    .with(loading, () => (
      <YStack fullscreen flex={1} justifyContent='center' alignItems='center' >
        <Paragraph paddingBottom='$3'> Loading...</Paragraph>
        < Spinner />
      </YStack>
    ))
    .with(empty, () => <Paragraph>没有更多数据 </Paragraph>)
    .with(success, () => (
      <UserList data={userList.data?.pages[0]?.items as any[]} isLoading={userList.isFetching} />
    ))
    .otherwise(() => <EmptyResult message={userList.failureReason?.message} />)

  return (
    <YStack flex={1} backgroundColor={'$background'} >
      {userListLayout}
    </YStack>
  )
}