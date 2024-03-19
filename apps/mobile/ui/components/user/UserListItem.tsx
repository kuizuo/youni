import { Avatar, XStack, YStack, SizableText } from '@/ui'
import { Link, useRouter } from 'expo-router'
import { UserFollowButton } from './UserFollowButton'
import { useUser } from '@/utils/auth/hooks/useUser'
import { UserInfoWithFollow } from '@server/modules/interact/interact'

export const UserListItem = (item: UserInfoWithFollow): React.ReactElement => {
  const { currentUser } = useUser()
  const router = useRouter()

  const handleNavigateToUser = () => {
    router.push(`/user/${item.id}/profile`)
  }

  return (
    <XStack padding='$3' gap='$3' height={'$8'} alignItems='center' >
      <Avatar circular size="$5" onPress={handleNavigateToUser}>
        <Avatar.Image
          width="100%"
          height="100%"
          // @ts-ignore
          source={{
            uri: item.avatar
          }}
        />
        <Avatar.Fallback />
      </Avatar>
      <YStack flex={1} onPress={handleNavigateToUser}>
        <XStack gap="$2" >
          <SizableText size="$4">
            {item.nickname}
          </SizableText>
        </XStack>

        <SizableText size='$1' color={'gray'}>
          {item.desc}
          {/* 笔记 · 1 | 粉丝 · 1 */}
        </SizableText>
      </YStack>
      {currentUser?.id !== item.id && <UserFollowButton isFollowing={item.isFollowing} userId={item.id} />}
    </XStack >
  )
}
