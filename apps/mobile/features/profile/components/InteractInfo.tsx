import { useUser } from "@/utils/auth/hooks/useUser"
import { trpc } from "@/utils/trpc"
import { MessageCircle, Settings } from "@tamagui/lucide-icons"
import { Link } from "expo-router"
import { XStack } from "tamagui"
import { Text, Button } from '@/ui'


export const InteractInfo = ({ userId }: { userId: string }) => {
  const { data } = trpc.interact.state.useQuery({ id: userId })

  const { profile } = useUser()

  const { mutateAsync: followUser } = trpc.interact.follow.useMutation()
  const { mutateAsync: unFollowUser } = trpc.interact.unfollow.useMutation()

  const handleFollow = async () => {
    if (data?.isFollow) {
      await unFollowUser({ id: userId })
    } else {
      await followUser({ id: userId })
    }
  }

  return <XStack gap='$4' padding='$4' alignItems="center">
    <Link href={'/friend'} asChild>
      <XStack gap='$2' alignItems="center">
        <Text>{data?.followingCount}</Text>
        <Text fontSize='$2'>
          关注
        </Text>
      </XStack>
    </Link>
    <Link href={'/friend'} asChild>
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
          <Button themeInverse size={'$2'} outlineColor={'white'} backgroundColor={'red'} borderRadius={50} onPress={handleFollow}>
            {data?.isFollow ? '关注' : '取关'}
          </Button>

          <Link href={`/chat/${userId}`} asChild>
            <Button themeInverse size={'$2'} outlineColor={'white'} backgroundColor={'red'} borderRadius={50} icon={<MessageCircle />} />
          </Link>
        </>
      }

    </XStack>
  </XStack >


}
