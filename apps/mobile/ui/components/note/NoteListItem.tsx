import type { ReactNode } from 'react'
import type { NoteItem } from '@server/modules/note/note'
import { useRouter } from 'expo-router'
import type { BaseUserInfo } from '@server/modules/user/user'
import { NoteSheet } from './NoteSheet'
import { NoteLikeButton } from './NoteLikeButton'
import { useSheetOpen } from '@/atoms/sheet'
import { Avatar, Card, Image, Text, View } from '@/ui'
import tw from '@/utils/tw'

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
      <View style={tw`flex-row flex-1 gap-2 items-center`} onPress={goToNote}>
        <Avatar circular style={tw`w-[12px] h-[12px]`}>
          <Avatar.Image
            // @ts-expect-error
            source={{
              uri: user.avatar,
              width: '100%',
              height: '100%',
            }}
          />
          <Avatar.Fallback />
        </Avatar>
        <Text style={tw`text-base opacity-70`}>
          {user.nickname}
        </Text>
      </View>
    )
  }

  return (
    <View style={tw`flex-1 relative p-1.5 gap-2 rounded-md`}>
      <Card size="$4" bg="$color2">
        <Card.Background unstyled onLongPress={handleLongPress} onPress={goToNote}>
          <Image
            source={{ uri: item.cover.src }}
            resizeMode="cover"
            style={tw`rounded-t-md w-full min-h-[200px] self-center`}
          />
        </Card.Background>
        <Card.Footer style={tw`p-2`}>
          <View style={tw`w-full gap-2`}>
            <Text style={tw`text-base`} numberOfLines={2} ellipsizeMode="tail" onPress={goToNote}>
              {item.title}
            </Text>
            <View style={tw`flex-row items-center gap-2`}>
              <UserAvatar user={item.user} />
              <View style={tw`flex-row flex-1 justify-end items-center gap-2 opacity-70`}>
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
