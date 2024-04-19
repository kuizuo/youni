import { Stack, useRouter } from 'expo-router'
import { Badge, BadgeText, Button, ButtonText, HStack, Image, Pressable, Text, VStack, View } from '@gluestack-ui/themed'
import { useCallback } from 'react'
import { useFocusEffect, useRoute } from '@react-navigation/native'
import { NotificationItem } from './components/NotificationItem'
import { trpc } from '@/utils/trpc'

export function NotificationScreen() {
  const [data, { refetch }] = trpc.notification.count.useSuspenseQuery()
  const router = useRouter()

  // 每次进入该页面自动刷新消息数量
  useFocusEffect(
    useCallback(() => {
      refetch()
      return () => {
      }
    }, []),
  )

  return (
    <>
      <Stack.Screen options={{
        headerShown: true,
        title: '消息',
        headerTitleAlign: 'center',
        headerShadowVisible: false,
      }}
      />
      <View
        flex={1}
        bg="$backgroundLight0"
        $dark-bg="$backgroundDark950"
      >
        <HStack p="$4" gap="$2" justifyContent="space-between" alignItems="center">
          <Pressable
            flex={1}
            position="relative"
            alignItems="center"
            gap="$2"
            onPress={() => router.push('/notification/like')}
          >
            <VStack>
              <Image width={60} height={60} source={require('./assets/images/heart.png')} alt="image" />
              {
                data?.count.like > 0 && (
                  <Badge
                    position="absolute"
                    h={22}
                    w={22}
                    bg="$red600"
                    borderRadius="$full"
                    zIndex={1}
                    variant="solid"
                    alignSelf="flex-end"
                  >
                    <BadgeText color="$white">
                      {data?.count.like}
                    </BadgeText>
                  </Badge>
                )
              }
            </VStack>
            <Text size="sm">赞</Text>
          </Pressable>
          <Pressable
            flex={1}
            position="relative"
            alignItems="center"
            gap="$2"
            onPress={() => router.push('/notification/comment')}
          >
            <VStack>
              <Image width={60} height={60} source={require('./assets/images/message.png')} alt="image" />
              {
                data?.count.comment > 0 && (
                  <Badge
                    position="absolute"
                    h={22}
                    w={22}
                    bg="$red600"
                    borderRadius="$full"
                    zIndex={1}
                    variant="solid"
                    alignSelf="flex-end"
                  >
                    <BadgeText color="$white">
                      {data?.count.comment}
                    </BadgeText>
                  </Badge>
                )
              }
            </VStack>
            <Text size="sm">评论</Text>
          </Pressable>
          <Pressable
            flex={1}
            position="relative"
            alignItems="center"
            gap="$2"
            onPress={() => router.push('/notification/follow')}
          >
            <VStack>
              <Image width={60} height={60} source={require('./assets/images/follow.png')} alt="image" />
              {
                data?.count.follow > 0 && (
                  <Badge
                    position="absolute"
                    h={22}
                    w={22}
                    bg="$red600"
                    borderRadius="$full"
                    zIndex={1}
                    variant="solid"
                    alignSelf="flex-end"
                  >
                    <BadgeText color="$white">
                      {data?.count.follow}
                    </BadgeText>
                  </Badge>
                )
              }
            </VStack>

            <Text size="sm">新增关注</Text>
          </Pressable>
        </HStack>

        <View>
          {/* <NotificationItem
            title="系统通知"
            image={require('./assets/images/heart.png')}
            desc=" "
            onPress={() => router.push('/notification/like')}
          />
          <NotificationItem
            title="系统通知"
            image={require('./assets/images/message.png')}
            desc=" "
            onPress={() => router.push('/notification/comment')}
          />
          <NotificationItem
            title="系统通知"
            image={require('./assets/images/follow.png')}
            desc=" "
            onPress={() => router.push('/notification/follow')}
          /> */}
          <NotificationItem
            title="系统通知"
            image={require('./assets/images/message2.png')}
            desc=" "
            onPress={() => router.push('/notification/system')}
          />
        </View>
      </View>
    </>
  )
}
