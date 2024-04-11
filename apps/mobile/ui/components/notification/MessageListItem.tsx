import React from 'react'
import type { MessageItem } from '@server/modules/notification/notification'
import { Link, useRouter } from 'expo-router'
import { Avatar, Image, Separator, SizableText, Text, View, XStack, YStack } from '@/ui'
import { formatTime } from '@/utils/date'

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
          <SizableText size="$3" ml="$2">
            {item.sender.nickname}
          </SizableText>
        </Link>

        <View w="$0.75" />

        <SizableText size="$3" color="gray">
          {actionString}
        </SizableText>

        <View w="$0.75" />
        {(item.sourceId && item.sourceType === 'Note') && (
          <Link href={`/note/${item.sourceId}`} asChild>
            <SizableText
              flexWrap="wrap"
              size="$3"
              numberOfLines={2}
            >
              {truncatedTitle }
            </SizableText>
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
      <XStack p="$3" gap="$3" ai="center">
        <Avatar circular size="$4" onPress={handleNavigateToUser}>
          <Avatar.Image
            width="100%"
            height="100%"
          // @ts-expect-error
            source={{
              uri: item.sender.avatar,
            }}
          />
          <Avatar.Fallback />
        </Avatar>
        <YStack flex={1}>
          <MessageTitle></MessageTitle>

          {item.content && <Text>{item.content}</Text>}

          <SizableText size="$1" color="gray">
            {formatTime(item.createdAt)}
          </SizableText>
        </YStack>
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
      </XStack>
      <Separator />
    </>
  )
}
