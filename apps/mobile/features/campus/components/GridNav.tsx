import { Image, Pressable, Text, View } from '@gluestack-ui/themed'
import { FlatList } from 'react-native'
import { router } from 'expo-router'
import { useCurrentCampus } from '@/atoms/campus'
import { useAuth } from '@/utils/auth'

interface ItemProp {
  title: string
  image: string
  onPress?: () => void
}

export function Item({ item }: { item: ItemProp }) {
  return (
    <Pressable flex={1} maxWidth="25%" alignItems="center" gap="$1.5" onPress={item.onPress}>
      <Image
        w="$12"
        h="$12"
        source={item.image}
        alt="image"
      >
      </Image>
      <Text size="sm">
        {item.title}
      </Text>
    </Pressable>
  )
}

export function GridNav() {
  const { currentUser } = useAuth()
  const [currentCampus, setCurrentCampus] = useCurrentCampus()

  const itemData: ItemProp[] = [
    {
      title: '我的课表',
      image: require('../assets/images/course.png'),
      onPress: () => router.push('/schedule/'),
    },
    {
      title: '我的成绩',
      image: require('../assets/images/gpa.png'),
    },
    {
      title: '活动日历',
      image: require('../assets/images/activity.png'),
    },
    {
      title: '校园导航',
      image: require('../assets/images/campus.png'),
    },
  ]

  // if (currentUser.campusId !== currentCampus?.id)
  //   return <></>

  return (
    <View
      px="$4"
      py="$4"
      bg="$backgroundLight0"
      $dark-bg="$backgroundDark950"
    >
      <FlatList
        data={itemData}
        numColumns={4}
        renderItem={Item}
        keyExtractor={item => item.title}
      />
    </View>
  )
}
