import { Tabs, useRouter } from 'expo-router'
import { LinearGradient } from '@tamagui/linear-gradient'
import { Clover, Home, MessageCircleMore, Plus } from '@tamagui/lucide-icons'
import { Avatar, Image, Square, Theme, View } from '@/ui'
import { useUser } from '@/utils/auth/hooks/useUser'
import tw from '@/utils/tw'

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
        tabBarActiveTintColor: tw.color(`bg-primary`),
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
          tabBarIcon: ({ color, size }) => <Clover color={color} size={size} />,
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
              <View style={tw`b-1 b-[${color}] rounded-full`}>
                <Avatar circular p="$1" size={size}>
                  <Image
                    source={{
                      uri: currentUser?.avatar,
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
  const bottom = 4

  return (
    <>
      <Theme name="dark">

        <LinearGradient
          style={tw.style(
            tw`absolute bg-primary bottom-[${bottom}] rounded-lg`,
            tw`w-[${size + 24}px]`,
            tw`h-[${size + 14}px]`,
          )}
          start={[1, 1]}
          end={[0.8, 0]}
          pressStyle={{
            scale: 1.1,
          }}
          onPress={() => {
            if (!isSignined) {
              router.replace('/sign-in')
              return
            }
            router.push('/create/')
          }}

        />
        <View
          style={tw.style(
            tw`absolute flex-1 justify-center content-center bottom-[${bottom}] `,
            tw`h-[${size + 14}px]`,
            tw`left-[14px]`,
          )}
          animation="quick"
          pointerEvents="none"
        >
          <Plus color="white" size={size + 14} />
        </View>
      </Theme>
    </>
  )
}
