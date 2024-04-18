import { Redirect, Tabs, useRouter } from 'expo-router'
import { Avatar, AvatarFallbackText, AvatarImage, Badge, BadgeText, Pressable, View, useToken } from '@gluestack-ui/themed'
import { Clover, Home, MessageCircleMore, Plus } from 'lucide-react-native'
import { useAuth } from '@/utils/auth'

export default function TabLayout() {
  const primaryColor = useToken('colors', 'primary500')

  const { isLogged, currentUser } = useAuth()

  if (!isLogged || !currentUser)
    return <Redirect href="/login" />

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
          tabBarIcon: ({ color, size }) => {
            return (
              <View position="relative" flexDirection="row" gap="$1.5">
                <MessageCircleMore color={color} size={size} />
                {
                  false && (
                    <Badge
                      position="absolute"
                      top={-4}
                      right={-4}
                      h={16}
                      w={16}
                      bg="$red600"
                      borderRadius="$full"
                      zIndex={1}
                      variant="solid"
                      alignSelf="flex-end"
                    >
                      <BadgeText color="$white">
                        1
                      </BadgeText>
                    </Badge>
                  )
                }
              </View>
            )
          },
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          href: {
            pathname: '/me',
            params: {
              id: currentUser.id,
            },
          },
          title: '我',
          tabBarIcon: ({ color, size }) => {
            return (
              <View borderWidth={2} borderColor={color} borderRadius="$full">
                <Avatar h={size} w={size} borderRadius="$full" overflow="hidden">
                  <AvatarFallbackText>{currentUser.nickname}</AvatarFallbackText>
                  <AvatarImage
                    source={{ uri: currentUser.avatar }}
                    alt="avatar"
                  />
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
  const { isLogged } = useAuth()

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
          if (!isLogged) {
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
