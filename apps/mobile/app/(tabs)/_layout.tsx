import { Tabs, useRouter } from 'expo-router';
import { Avatar, Circle, Theme, YStack, useThemeName, Image } from '@/ui'
import { LinearGradient } from '@tamagui/linear-gradient'
import { Plus, Home, Clover, MessageCircleMore } from '@tamagui/lucide-icons'
import { useUser } from '@/utils/auth/hooks/useUser';

export default function TabLayout() {
  const { currentUser, isLoading } = useUser()

  if (isLoading) {
    return <></>
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderWidth: 0,
        },
      }}>
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
              <Theme inverse>
                <PlusButton size={size} />
              </Theme>
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
              id: currentUser!.id
            }
          },
          title: '我',
          tabBarIcon: ({ color, size }) => {
            return (
              <YStack borderWidth="$1" borderColor={color} borderRadius="$10">
                <Avatar circular padding="$1" size={size}>
                  <Image
                    source={{
                      uri: currentUser?.avatar!,
                      width: size,
                      height: size,
                    }} alt="your avatar" />
                </Avatar>
              </YStack>
            )
          },
        }}
      />
    </Tabs>
  );
}


const PlusButton = ({ size }: { size: number }) => {
  const router = useRouter()
  const theme = useThemeName()
  const isDark = theme.startsWith('dark')

  return (
    <>
      <Circle
        position="absolute"
        bottom={8}
        backgroundColor="$color1"
        shadowColor='black'
        shadowOpacity={isDark ? 0.7 : 1}
        shadowRadius={isDark ? 3 : 10}
        shadowOffset={{
          height: 0,
          width: 5,
        }}
        width={size + 24}
        height={size + 24}
      />
      <LinearGradient
        position="absolute"
        onPress={() => router.push('/create')}
        colors={['$gray6', '$gray7']}
        start={[1, 1]}
        end={[0.8, 0]}
        width={size + 24}
        height={size + 24}
        borderRadius="$10"
        bottom={8}
        pressStyle={{
          rotate: '20deg',
        }}
      />
      <YStack
        position="absolute"
        bottom={8}
        justifyContent="center"
        alignContent="center"
        animation="quick"
        pointerEvents="none"
        height={size + 24}
      >
        <Plus color="$color" size={size + 16} />
      </YStack>
    </>
  )
}
