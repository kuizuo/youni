import { Tabs, useRouter } from 'expo-router'
import { Avatar, AvatarFallbackText, AvatarImage, Pressable, View, useToken } from '@gluestack-ui/themed'
import { Clover, Home, MessageCircleMore, Plus } from 'lucide-react-native'
import { useUser } from '@/utils/auth/hooks/useUser'

export default function TabLayout() {
  const primaryColor = useToken('colors', 'primary500')
  const { currentUser, isLoading } = useUser()

  if (isLoading)
    return <></>

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderWidth: 0,
        },
        tabBarActiveTintColor: primaryColor,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="campus"
        options={{
          title: '校园',
          tabBarIcon: ({ color, size }) => <Clover color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="_create"
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            event.preventDefault()
          },
        })}
        options={{
          title: '',
          tabBarIcon: ({ size }) => <PlusButton size={size} />,
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: '消息',
          tabBarIcon: ({ color, size }) => <MessageCircleMore color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          href: {
            pathname: '/me',
            params: {
              id: currentUser?.id,
            },
          },
          title: '我',
          tabBarIcon: ({ color, size }) => {
            return (
              <View borderWidth={1} borderColor={color} borderRadius="$full">
                <Avatar h={size} w={size}>
                  <AvatarFallbackText>{currentUser?.nickname}</AvatarFallbackText>
                  {/* <AvatarImage
                    source={{
                      uri: currentUser?.avatar,
                    }}
                    alt="avatar"
                  /> */}
                </Avatar>
              </View>
            )
          },
        }}
      />
    </Tabs>
  )
}

function PlusButton({ size }: { size: number }) {
  const router = useRouter()
  const { isSignined } = useUser()

  return (
    <>
      <Pressable
        position="absolute"
        bg="$primary500"
        $hover-bg="$primary400"
        rounded="$lg"
        w={size + 24}
        h={size + 14}
        onPress={() => {
          if (!isSignined) {
            router.replace('/login')
            return
          }
          router.push('/create/')
        }}
      />
      <View
        style={{
          height: size + 14,
        }}
        pointerEvents="none"
      >
        <Plus color="white" size={size + 14} />
      </View>
    </>
  )
}
