import { Stack, useRouter } from 'expo-router'
import { NotificationItem } from './components/NotificationItem'
import { Image, Text, XStack, YStack } from '@/ui'
import { trpc } from '@/utils/trpc'

export function NotificationScreen(): React.ReactNode {
  const { data } = trpc.notification.count.useQuery()
  const router = useRouter()

  return (
    <>
      <Stack.Screen options={{
        headerShown: true,
        title: '消息',
        headerTitleAlign: 'center',
        headerShadowVisible: false,
      }}
      />

      <YStack flex={1} bg="$background">
        <XStack jc="space-around" p="$4" ai="center" gap="$2">
          <YStack
            position="relative"
            flex={1}
            jc="center"
            ai="center"
            gap="$2"
            onPress={() => router.push('/notification/like')}
          >
            <Image width={60} height={60} source={require('@/assets/images/heart.png')}></Image>
            {/* {
            data?.count.like! > 0 && <Text position="absolute" top={0} right={20}>{data?.count.like} </Text>
          } */}
            <Text fontSize="$3">赞</Text>
          </YStack>
          <YStack
            position="relative"
            flex={1}
            jc="center"
            ai="center"
            gap="$2"
            onPress={() => router.push('/notification/comment')}
          >
            <Image width={60} height={60} source={require('@/assets/images/message.png')}></Image>
            {
            data?.count.comment > 0 && (
              <Text position="absolute" top={0} right={20}>
                {data?.count.comment}
                {' '}
              </Text>
            )
          }
            <Text fontSize="$3">评论</Text>
          </YStack>
          <YStack
            position="relative"
            flex={1}
            jc="center"
            ai="center"
            gap="$2"
            onPress={() => router.push('/notification/follow')}
          >
            <Image width={60} height={60} source={require('@/assets/images/follow.png')}></Image>
            {
            data?.count?.follow! > 0 && (
              <Text position="absolute" top={0} right={20}>
                {data?.count.follow}
                {' '}
              </Text>
            )
          }
            <Text fontSize="$3">新增关注</Text>
          </YStack>
        </XStack>
        <YStack>
          <NotificationItem
            title="系统通知"
            image={require('@/assets/images/message2.png')}
            desc=" "
            onPress={() => router.push('/notification/system')}
          />
        </YStack>
      </YStack>
    </>
  )
}
