import { Tabs, useRouter } from 'expo-router'
import { LinearGradient } from '@tamagui/linear-gradient'
import { Clover, Home, MessageCircleMore, Plus } from '@tamagui/lucide-icons'
import { Avatar, Image, Square, Theme, YStack, useTheme } from '@/ui'
import { useUser } from '@/utils/auth/hooks/useUser'

export default function TabLayout() {
  const theme = useTheme()
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
        tabBarActiveTintColor: theme.$accent10?.get(),
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
            navigation.navigate('create')
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
              <YStack borderWidth="$1" borderColor={color} br="$10">
                <Avatar circular p="$1" size={size}>
                  <Image
                    source={{
                      uri: currentUser?.avatar!,
                      width: size,
                      height: size,
                    }}
                    alt="your avatar"
                  />
                </Avatar>
              </YStack>
            )
          },
        }}
      />
    </Tabs>
  )
}

function PlusButton({ size }: { size: number }) {
  const router = useRouter()
  const bottom = 4

  return (
    <>
      <Theme name="dark">
        <Square
          position="absolute"
          bottom={bottom}
          bg="$accent10"
          br="$5"
          width={size + 24}
          height={size + 14}
          pressStyle={{
            scale: 1.1,
          }}
        />
        <LinearGradient
          position="absolute"
          onPress={() => router.push('/create')}
          colors={['$accent10', '$accent10']}
          start={[1, 1]}
          end={[0.8, 0]}
          width={size + 24}
          height={size + 14}
          br="$5"
          bottom={bottom}
          pressStyle={{
            scale: 1.1,
          }}
        />
        <YStack
          position="absolute"
          bottom={bottom}
          jc="center"
          alignContent="center"
          animation="quick"
          pointerEvents="none"
          height={size + 14}
        >
          <Plus color="$color" size={size + 14} />
        </YStack>
      </Theme>
    </>
  )
}
