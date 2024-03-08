import { Avatar, XStack, YStack, Image, Text, SizableText, Button } from '@/ui'
import { Link, useRouter } from 'expo-router'
import { UserInfo } from '@server/modules/user/user'
import { FollowButton } from './FollowButton'
import { useUser } from '@/utils/auth/hooks/useUser'

export const UserListItem = (item: UserInfo): React.ReactElement => {
  const { profile } = useUser()
  const router = useRouter()

  const goToUser = () => {
    router.push(`/user/${item.id}/profile`)
  }

  return (
    <XStack padding='$3' gap='$3' height={'$8'} alignItems='center' >
      <Avatar circular size="$5" onPress={goToUser}>
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
      <YStack flex={1} onPress={goToUser}>
        <XStack gap="$2" >
          <SizableText size="$4">
            {item.nickname}
          </SizableText>
        </XStack>

        <SizableText size='$1' color={'gray'}>
          {item.desc ?? '123'}
          {/* 笔记 · 1 | 粉丝 · 1 */}
        </SizableText>
      </YStack>
      {profile?.id !== item.id && <FollowButton isFollow={false} userId={item.id} />}

    </XStack >
  )
}
