import { Stack, useRouter } from 'expo-router'
import { Badge, BadgeText, Button, ButtonText, HStack, Image, Pressable, Text, VStack, View } from '@gluestack-ui/themed'
import { useCallback } from 'react'
import { useFocusEffect, useRoute } from '@react-navigation/native'
import { NotificationItem } from './components/NotificationItem'
import { trpc } from '@/utils/trpc'

interface ItemProps {
  title: string
  image: string
  count: number
  onPress: () => void
}

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

  const items: ItemProps[] = [
    {
      title: '赞',
      image: require('./assets/images/heart.png'),
      count: data?.count.like,
      onPress: () => router.push('/notification/like'),
    },
    {
      title: '评论',
      image: require('./assets/images/message.png'),
      count: data?.count.comment,
      onPress: () => router.push('/notification/comment'),
    },
    {
      title: '新增关注',
      image: require('./assets/images/follow.png'),
      count: data?.count.follow,
      onPress: () => router.push('/notification/follow'),
    },

  ]

  function Item({
    title,
    onPress,
    image,
    count,
  }: ItemProps) {
    return (
      <Pressable
        flex={1}
        position="relative"
        alignItems="center"
        gap="$2"
        onPress={onPress}
      >
        <VStack>
          <Image width={60} height={60} source={image} alt="image" />
          {
            count > 0 && (
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
                  {count}
                </BadgeText>
              </Badge>
            )
          }
        </VStack>
        <Text size="sm">{title}</Text>
      </Pressable>
    )
  }

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
          {
            items.map(item => (<Item key={item.title} {...item} />))
          }
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
            image={require('./assets/images/system.png')}
            desc=" "
            onPress={() => router.push('/notification/system')}
          />
        </View>
      </View>
    </>
  )
}
