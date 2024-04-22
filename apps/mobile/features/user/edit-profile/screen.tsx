import { Avatar, AvatarImage, Box, Center, Divider, HStack, Icon, Pressable, Text, View } from '@gluestack-ui/themed'
import { Camera, ChevronRight } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import { PermissionStatus } from 'expo-image-picker'

import { useCallback, useState } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import { NavBar } from '@/ui/components/NavBar'
import { NavButton } from '@/ui/components/NavButton'
import { useAuth } from '@/utils/auth'
import { ListGroup } from '@/ui/components/ListGroup'
import { ListItem } from '@/ui/components/ListItem'
import { uploadImage } from '@/utils/upload'
import { trpc } from '@/utils/trpc'
import { useColor } from '@/utils/theme'

export function EditProfileScreen() {
  const router = useRouter()
  // const { currentUser } = useAuth()
  const { textColor, bgColor, bgMutedColor } = useColor()

  const [currentUser, { isLoading, refetch }] = trpc.user.profile.useSuspenseQuery()

  useFocusEffect(
    useCallback(() => {
      refetch()
      return () => {
      }
    }, []),
  )

  const { mutateAsync: updateProfile } = trpc.user.updateProfile.useMutation()
  const [newAvatar, setNewAvatar] = useState<string>()

  const pickImageAsync = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status === PermissionStatus.GRANTED) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // 只允许选择图片
        allowsEditing: true,
        allowsMultipleSelection: false,
        selectionLimit: 1,
        quality: 1,
      })

      if (!result.canceled) {
        setNewAvatar(result.assets[0]!.uri)
        uploadImage(result.assets.map(asset => ({
          src: asset.uri,
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.type,
        })) as unknown as ImagePicker.ImagePickerAsset[], 'avatar')

        updateProfile({
          avatar: newAvatar,
        })
      }
    }
    else {
      // toast.show({
      //   placement: 'bottom right',
      //   render: ({ id }) => {
      //     return (
      //       <Toast nativeID={id} variant="accent" action="warning">
      //         <ToastTitle>请允许授权相册</ToastTitle>
      //       </Toast>
      //     )
      //   },
      // })
    }
  }
  return (
    <View flex={1} bg={bgColor}>
      <NavBar left={<NavButton.Back />} right={<></>} bg="$backgroundLight0" $dark-bg="$backgroundDarkMuted">
        <Text flex={1} textAlign="center">编辑资料</Text>
      </NavBar>

      <View flex={1}>
        <Center position="relative" p="$4" pb="$8" bg="$backgroundLight0" $dark-bg="$backgroundDarkMuted">
          <Pressable onPress={pickImageAsync}>
            <Avatar borderRadius="$full" overflow="hidden" size="xl">
              <AvatarImage
                source={{ uri: newAvatar || currentUser.avatar }}
                alt="avatar"
              />
            </Avatar>
            <Box position="absolute" right={0} bottom={0} bg={textColor} p="$1" borderRadius="$full">
              <Icon as={Camera} color={bgColor} />
            </Box>
          </Pressable>

        </Center>

        <ListGroup divider={<Divider />}>
          <ListItem
            title="昵称"
            right={(
              <HStack alignItems="center">
                <Text size="sm">{currentUser.nickname}</Text>
                <Icon as={ChevronRight} size="md" color="$secondary500" />
              </HStack>
            )}
            onPress={() => router.push('/user/edit-profile/name')}
          />
          <ListItem
            title="简介"
            right={(
              <HStack alignItems="center">
                <Text size="sm">{currentUser.desc}</Text>
                <Icon as={ChevronRight} size="md" color="$secondary500" />
              </HStack>
            )}
            onPress={() => router.push('/user/edit-profile/desc')}
          />
          <ListItem
            title="性别"
            right={(
              <HStack alignItems="center">
                <Text size="sm">{currentUser.gender === 0 ? '未知' : currentUser.gender === 1 ? '男' : '女'}</Text>
                <Icon as={ChevronRight} size="md" color="$secondary500" />
              </HStack>
            )}
            onPress={() => router.push('/user/edit-profile/gender')}
          />
          <ListItem
            title="学校"
            right={(
              <HStack alignItems="center">
                <Text size="sm">{currentUser.campusId}</Text>
                <Icon as={ChevronRight} size="md" color="$secondary500" />
              </HStack>
            )}
            onPress={() => router.push('/user/edit-profile/name')}
          />
        </ListGroup>

        <ListGroup mt="$4" divider={<Divider />}>
          <ListItem
            title="其他"
          />
        </ListGroup>
      </View>
    </View>
  )
}
