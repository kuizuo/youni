import React from 'react'
import type { MessageItem } from '@server/modules/notification/notification'
import { Link, useRouter } from 'expo-router'
import { Avatar, Image, Separator, Text, View } from '@/ui'
import { formatTime } from '@/utils/date'
import tw from '@/utils/tw'

export function MessageListItem(item: MessageItem): React.ReactNode {
  const router = useRouter()

  const MessageTitle = () => {
    const actionMap = {
      Like: {
        Note: '赞了你的笔记',
        Comment: '赞了你在文章的评论',
      },
      Comment: {
        Note: '评论了你的笔记',
        Comment: '评论了你的评论',
      },
      Follow: {
        User: '关注了你',
      },
      System: {
        Notice: '系统通知',
      },
    }

    const actionString = actionMap[item.action][item.sourceType]

    const truncatedTitle = item.source.title.length > 16 ? `${item.source.title.slice(0, 16)}...` : item.source.title
    return (
      <Text>
        <Link href={`/user/${item.sender.id}/profile`} asChild>
          <Text style={tw`text-base mt-2`}>
            {item.sender.nickname}
          </Text>
        </Link>

        <View w="$0.75" />

        <Text style={tw`text-base text-gray-500`}>
          {actionString}
        </Text>

        <View w="$0.75" />
        {(item.sourceId && item.sourceType === 'Note') && (
          <Link href={`/note/${item.sourceId}`} asChild>
            <Text
              style={tw`flex-warp text-base`}
              numberOfLines={2}
            >
              {truncatedTitle}
            </Text>
          </Link>
        )}
      </Text>
    )
  }

  const handleNavigateToUser = () => {
    router.push(`/user/${item.sender.id}/profile`)
  }

  return (
    <>
      <View style={tw`flex-row items-center p-3 gap-3`}>
        <Avatar circular size="$4" onPress={handleNavigateToUser}>
          <Avatar.Image
            // @ts-expect-error
            source={{
              uri: item.sender.avatar,
              width: '100%',
              height: '100%',
            }}
          />
          <Avatar.Fallback />
        </Avatar>
        <View style={tw`flex-1`}>
          <MessageTitle></MessageTitle>

          {item.content && <Text>{item.content}</Text>}

          <Text style={tw`text-sm text-gray`}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
        {item.source.image && (
          <Image
            br="$2"
            source={{
              uri: item.source.image.src,
              width: 50,
              height: 50,
            }}
          />
        )}
      </View>
      <Separator />
    </>
  )
}
