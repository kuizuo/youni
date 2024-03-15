import { FollowButton } from "@/ui/components/user/FollowButton"
import { UserInfo } from "@server/modules/user/user"
import { Link, useRouter } from "expo-router"
import { XStack, Avatar, Text, Button } from "@/ui"
import { trpc } from "@/utils/trpc"
import { useUser } from "@/utils/auth/hooks/useUser"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import React from "react"
import { ArrowUpRightFromSquare, ChevronLeft } from "@tamagui/lucide-icons"

interface Props {
  user: Pick<UserInfo, 'id' | 'nickname' | 'avatar'>
}

export const NoteHeader = ({ user }: Props): React.ReactNode => {
  const { currentUser } = useUser()
  const router = useRouter()
  const { top } = useSafeAreaInsets()

  const { data: isFollowing, isLoading } = trpc.interact.isFollowing.useQuery({ id: user.id! }, { enabled: !!user.id })

  return <XStack padding='$3' paddingTop={top} gap="$4" alignItems="center" backgroundColor={'$background'} >
    <Button icon={<ChevronLeft size={'$1'} />} unstyled onPress={() => router.back()} />
    <Link href={`/user/${user.id}/profile`} asChild>
      <XStack flex={1} gap='$2.5' alignItems='center'>
        <Avatar circular size="$2">
          <Avatar.Image
            // @ts-ignore
            source={{
              uri: user.avatar!,
              width: '100%',
              height: '100%',
            }}
          />
          <Avatar.Fallback />
        </Avatar>
        <Text fontSize={14} opacity={0.7} >
          {user.nickname}
        </Text>
      </XStack>
    </Link>
    {isLoading || currentUser?.id === user?.id ? <></> : <FollowButton userId={user.id} isFollowing={isFollowing!} />}
    <Button size={'$1'} icon={<ArrowUpRightFromSquare size={'$1'} />} unstyled></Button>
  </XStack>
}