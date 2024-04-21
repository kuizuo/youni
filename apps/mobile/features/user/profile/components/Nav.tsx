import { Highlighter, History, LifeBuoy } from 'lucide-react-native'
import type { LucideProps } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { BlurView } from 'expo-blur'
import { Icon, Pressable, Text, Toast, ToastTitle, View, useToast } from '@gluestack-ui/themed'
import type { Campus } from '@youni/database'
import { useAuth } from '@/utils/auth'
import { useCurrentCampus } from '@/atoms/campus'
import { useColor } from '@/utils/theme'

export function Navs() {
  interface Item {
    icon: React.ReactElement<LucideProps>
    text: string
    desc: string
    onPress: () => void
  }

  const router = useRouter()
  const [currentCampus, setCurrentCampus] = useCurrentCampus()
  const { currentUser } = useAuth()
  const toast = useToast()

  const { textColor, borderColor } = useColor()

  const navItems: Item[] = [
    {
      onPress: () => {
        if (currentUser.campusId) {
          setCurrentCampus({
            id: currentUser.campus!.id,
          } as Campus)
          router.push({
            pathname: '/campus',
            // params: { id: currentUser.campus!.id },
          })
          return
        }

        toast.show({
          placement: 'bottom',
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="warning">
                <ToastTitle>请完成学生认证后查看</ToastTitle>
              </Toast>
            )
          },
        })
      },
      icon: <Icon as={LifeBuoy} size="md" color={textColor} />,
      text: '我的校园',
      desc: '校园动态',
    },
    {
      onPress: () => router.push('/(creator)'),
      icon: <Icon as={Highlighter} size="md" color={textColor} />,
      text: '创作中心',
      desc: '创造你的世界',
    },
    {
      onPress: () => router.push('/history/'),
      icon: <Icon as={History} size="md" color={textColor} />,
      text: '浏览记录',
      desc: '看过的笔记',
    },
  ]

  return (
    <View className="flex-row mx-4 mb-3 gap-3">
      {
        navItems.map(({ text, icon, desc, onPress }) => {
          return (
            <BlurView
              key={text}
              className="flex-1 rounded-md overflow-hidden px-3 py-2"
              style={{
                borderWidth: 1,
                borderColor,
              }}
            >
              <Pressable onPress={onPress}>
                <View
                  className="flex-row items-center gap-1"
                >
                  {icon}
                  <Text size="sm">
                    {text}
                  </Text>
                </View>
                <Text size="xs" color="$secondary500">
                  {desc}
                </Text>
              </Pressable>

            </BlurView>
          )
        })
      }
    </View>
  )
}
