import { Tabs, useRouter } from 'expo-router'
import { Avatar, Icon, Image, View, useToken } from '@gluestack-ui/themed'
import { TouchableOpacity } from 'react-native'
import { Home, Plus } from 'lucide-react-native'
import { useUser } from '@/utils/auth/hooks/useUser'
import { theme } from '@/utils/tw'

export default function TabLayout() {
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
        // tabBarActiveTintColor: theme.colors.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => <Icon as={Home} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="campus"
        options={{
          title: '校园',
          tabBarIcon: ({ color, size }) => <Icon as={Home} color={color} size={size} />,
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
          tabBarIcon: ({ size }) => {
            return (
              <PlusButton size={size} />
            )
          },
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: '消息',
          tabBarIcon: ({ color, size }) => <Icon as={Home} color={color} size={size} />,
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
              <View className={`b-1 b-[${color}] rounded-full`}>
                <Avatar className="rounded-full" size={size}>
                  <Image
                    source={{
                      uri: currentUser.avatar!,
                      width: size,
                      height: size,
                    }}
                    alt="your avatar"
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
  const { isSignined } = useUser()

  // TODO: fixme
  return (
    <>
      <TouchableOpacity
        className="absolute bg-primary rounded-lg"
        style={{
          width: size + 24,
          height: size + 14,
        }}
      // pressStyle={{
      //   scale: 1.1,
      // }}
      // onPress={() => {
      //   if (!isSignined) {
      //     router.replace('/sign-in')
      //     return
      //   }
      //   router.push('/create/')
      // }}

      />
      <View
        className="absolute justify-center content-center"
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
