import { useUser } from "@/utils/auth/hooks/useUser"
import { trpc } from "@/utils/trpc"
import { MessageCircle, Settings } from "@tamagui/lucide-icons"
import { Link } from "expo-router"
import { XStack } from "tamagui"
import { Text, Button } from '@/ui'
import { FollowButton } from "@/ui/user/FollowButton"

interface Props {
  userId: string
  nickname: string
}

export const InteractInfo = ({ userId, nickname }: Props): React.ReactNode => {
  const { data } = trpc.interact.state.useQuery({ id: userId })

  const { profile } = useUser()


  return <XStack gap='$4' padding='$4' alignItems="center">
    <Link
      href={{
        pathname: '/user/[id]/follower',
        params: { id: userId, type: 'following', title: nickname }
      }}
      asChild
    >
      <XStack gap='$2' alignItems="center">
        <Text>{data?.followingCount}</Text>
        <Text fontSize='$2'>
          关注
        </Text>
      </XStack>
    </Link>
    <Link
      href={{
        pathname: '/user/[id]/follower',
        params: { id: userId, type: 'followers', title: nickname }
      }}
      asChild
    >
      <XStack gap='$2' alignItems="center">
        <Text>{data?.followerCount}</Text>
        <Text fontSize='$2'>
          粉丝
        </Text>
      </XStack>
    </Link>
    <Link href={'/friend'} asChild>
      <XStack gap='$2' alignItems="center">
        <Text>{data?.likesCount}</Text>
        <Text fontSize='$2'>
          获赞
        </Text>
      </XStack>
    </Link>

    <XStack flex={1} justifyContent="flex-end" gap="$3">
      {
        profile?.id === userId ? <>
          <Link href="/profile/edit" asChild>
            <Button themeInverse size={'$2'} outlineColor={'white'} backgroundColor={'aliceblue'} borderRadius={50}>
              编辑资料
            </Button>
          </Link>
          <Link href='/setting/' asChild>
            <Button themeInverse size={'$2'} outlineColor={'white'} backgroundColor={'aliceblue'} borderRadius={50} icon={<Settings />} />
          </Link>
        </> : <>
          <FollowButton userId={userId} isFollow={data?.isFollow!}></FollowButton>

          <Link href={`/chat/${userId}`} asChild>
            <Button themeInverse size={'$2'} outlineColor={'white'} backgroundColor={'red'} borderRadius={50} icon={<MessageCircle />} />
          </Link>
        </>
      }

    </XStack>
  </XStack >


}
