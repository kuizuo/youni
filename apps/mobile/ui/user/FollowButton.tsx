import { Button } from "@/ui"
import { trpc } from "@/utils/trpc"
import { useState } from "react"

interface Props {
  userId: string
  isFollowing: boolean
}

export const FollowButton = ({ userId, isFollowing: initState }: Props) => {
  const [isFollowing, setIsFollowing] = useState(initState)
  const { mutateAsync: followUser } = trpc.interact.follow.useMutation()
  const { mutateAsync: unFollowUser } = trpc.interact.unfollow.useMutation()

  const handleFollow = async () => {
    if (isFollowing) {
      await unFollowUser({ id: userId })
    } else {
      await followUser({ id: userId })
    }
    setIsFollowing(!isFollowing)
  }

  return <Button
    themeInverse
    paddingHorizontal="$4"
    size={'$2'}
    outlineColor={'$red'}
    borderColor={'red'}
    color={'red'}
    backgroundColor={'$color'}
    borderRadius={50}
    onPress={handleFollow}
    onStartShouldSetResponderCapture={() => true}
  >
    {isFollowing ? '取关' : '关注'}
  </Button>
}