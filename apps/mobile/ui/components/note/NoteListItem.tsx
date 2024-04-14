import type { ReactNode } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { useRouter } from 'expo-router'
import type { BaseUserInfo } from '@server/modules/user/user'
import { Pressable } from '../MyComponent'
import { NoteSheet } from './NoteSheet'
import { NoteLikeButton } from './NoteLikeButton'
import { useSheetOpen } from '@/atoms/sheet'
import { Avatar, Card, Image, Text, TouchableOpacity, View } from '@/ui'

export function NoteListItem(item: NoteItem): ReactNode {
  const router = useRouter()
  const [_, setSheetOpen] = useSheetOpen()

  const goToNote = () => {
    router.push({
      pathname: `/note/[id]`,
      params: { id: item.id },
    })
  }

  const handleLongPress = () => {
    setSheetOpen(true)
  }

  function UserAvatar({ user }: { user: BaseUserInfo }): ReactNode {
    return (
      <Pressable className="flex-row flex-1  gap-2 items-center" onPress={goToNote}>
        <Avatar circular size="$2">
          <Image
            className="w-[2px] h-[2px] rounded-full bg-gray-50"
            // @ts-expect-error
            source={{
              uri: user.avatar,
              width: '100%',
              height: '100%',
            }}
          />
        </Avatar>
        <Text className="text-base opacity-70">
          {user.nickname}
        </Text>
      </Pressable>
    )
  }

  return (
    <View className="flex-1 relative p-1.5 gap-2 rounded-md">
      <Card className="bg-card">
        <Card.Background unstyled onLongPress={handleLongPress} onPress={goToNote}>
          <Image
            source={{ uri: item.cover.src }}
            resizeMode="cover"
            className="rounded-t-md w-full min-h-[200px] self-center"
          />
        </Card.Background>
        <Card.Footer className="p-2">
          <View className="w-full gap-2">
            <Text className="text-base" numberOfLines={2} ellipsizeMode="tail" onPress={goToNote}>
              {item.title}
            </Text>
            <View className="flex-row items-center gap-2">
              <UserAvatar user={item.user} />
              <View className="flex-row flex-1 justify-end items-center gap-2 opacity-70">
                <NoteLikeButton item={item} />
              </View>
            </View>
          </View>
        </Card.Footer>
      </Card>
      <NoteSheet item={item} />
    </View>
  )
}
