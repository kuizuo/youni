import { Stack, useRouter } from 'expo-router'
import { NotificationItem } from './components/NotificationItem'
import { Image, Text, View } from '@/ui'
import { trpc } from '@/utils/trpc'
import tw from '@/utils/tw'

export function NotificationScreen() {
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
      <View style={tw`flex-1 bg-background`}>
        <View style={tw`flex-row p-4 justify-center items-center gap-2`}>
          <View
            style={tw`relative flex-1 justify-center items-center gap-2`}
            onPress={() => router.push('/notification/like')}
          >
            <Image width={60} height={60} source={require('@/assets/images/heart.png')}></Image>

            <Text style={tw`text-md`}>赞</Text>
          </View>
          <View
            style={tw`relative flex-1 justify-center items-center gap-2`}
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
            <Text style={tw`text-md`}>评论</Text>
          </View>
          <View
            style={tw`relative flex-1 justify-center items-center gap-2`}
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
            <Text style={tw`text-md`}>新增关注</Text>
          </View>
        </View>

        <View>
          {/* <NotificationItem
            title="系统通知"
            image={require('@/assets/images/heart.png')}
            desc=" "
            onPress={() => router.push('/notification/like')}
          />
          <NotificationItem
            title="系统通知"
            image={require('@/assets/images/message.png')}
            desc=" "
            onPress={() => router.push('/notification/comment')}
          />
          <NotificationItem
            title="系统通知"
            image={require('@/assets/images/follow.png')}
            desc=" "
            onPress={() => router.push('/notification/follow')}
          /> */}
          <NotificationItem
            title="系统通知"
            image={require('@/assets/images/message2.png')}
            desc=" "
            onPress={() => router.push('/notification/system')}
          />
        </View>
      </View>
    </>
  )
}
