import { Avatar, AvatarImage, Center, Divider, HStack, Icon, Text, View } from '@gluestack-ui/themed'
import { ChevronRight } from 'lucide-react-native'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'
import { useAuth } from '@/utils/auth'
import { ListGroup } from '@/ui/components/ListGroup'
import { ListItem } from '@/ui/components/ListItem'

export function EditProfileScreen() {
  const { currentUser } = useAuth()

  return (
    <View flex={1} bg="$backgroundLight100">
      <NavBar left={<NavButton.Back />} right={<></>}>
        <Text flex={1} textAlign="center">编辑资料</Text>
      </NavBar>

      <View flex={1}>
        <Center p="$4" bg="$backgroundLight0">
          <Avatar borderRadius="$full" overflow="hidden" size="xl">
            <AvatarImage
              source={{ uri: currentUser.avatar }}
              alt="avatar"
            />
          </Avatar>
        </Center>

        <ListGroup pt="$4" bg="$backgroundLight0" divider={<Divider />}>
          <ListItem
            title="昵称"
            right={(
              <HStack alignItems="center">
                <Text size="sm">{currentUser.nickname}</Text>
                <Icon as={ChevronRight} size="md" color="$secondary500" />
              </HStack>
            )}
          />
          <ListItem
            title="简介"
            right={(
              <HStack alignItems="center">
                <Text size="sm">{currentUser.desc}</Text>
                <Icon as={ChevronRight} size="md" color="$secondary500" />
              </HStack>
            )}
          />
          <ListItem
            title="性别"
            right={(
              <HStack alignItems="center">
                <Text size="sm">{currentUser.gender === 0 ? '未知' : currentUser.gender === 1 ? '男' : '女'}</Text>
                <Icon as={ChevronRight} size="md" color="$secondary500" />
              </HStack>
            )}
          />
          <ListItem
            title="学校"
            right={(
              <HStack alignItems="center">
                <Text size="sm">{currentUser.campusId}</Text>
                <Icon as={ChevronRight} size="md" color="$secondary500" />
              </HStack>
            )}
          />
        </ListGroup>

        <ListGroup mt="$4" bg="$backgroundLight0" divider={<Divider />}>
          <ListItem
            title="其他"
          />
        </ListGroup>
      </View>
    </View>
  )
}
