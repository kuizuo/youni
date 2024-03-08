import { Button } from "@/ui"
import { trpc } from "@/utils/trpc"
import { useState } from "react"

interface Props {
  userId: string
  isFollow: boolean
}

export const FollowButton = ({ userId, isFollow: initialIsFollow }: Props) => {
  const [isFollow, setIsFollow] = useState(initialIsFollow);
  const { mutateAsync: followUser } = trpc.interact.follow.useMutation()
  const { mutateAsync: unFollowUser } = trpc.interact.unfollow.useMutation()

  const handleFollow = async () => {
    if (isFollow) {
      await unFollowUser({ id: userId })
    } else {
      await followUser({ id: userId })
    }
    setIsFollow(!isFollow)
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
    {isFollow ? '取关' : '关注'}
  </Button>
}