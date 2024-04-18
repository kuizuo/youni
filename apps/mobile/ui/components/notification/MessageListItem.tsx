import React from 'react'
import type { MessageItem } from '@server/modules/notification/notification'
import { Link, useRouter } from 'expo-router'
import { Avatar, AvatarImage, Divider, HStack, Image, Pressable, Text, View } from '@gluestack-ui/themed'
import { formatTime } from '@/utils/date'

export function MessageListItem(item: MessageItem): React.ReactNode {
  const router = useRouter()

  const MessageTitle = (item: MessageItem) => {
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

    const truncatedTitle = item.source.title?.length > 16 ? `${item.source.title.slice(0, 16)}...` : item.source.title
    return (
      <Text>
        <Link href={`/user/${item.sender.id}/profile`} asChild>
          <Text mt="$2" size="md">
            {item.sender.nickname}
          </Text>
        </Link>

        <View w="$1" />

        <Text size="sm" color="$secondary600">
          {actionString}
        </Text>

        <View w="$1" />
        {(item.sourceId && item.sourceType === 'Note') && (
          <Link href={`/note/${item.sourceId}`} asChild>
            <Text
              flexWrap="wrap"
              size="sm"
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
      <HStack px="$3" py="$1.5" alignItems="center" gap="$3">
        <Pressable onPress={handleNavigateToUser}>
          <Avatar borderRadius="$full" size="md" overflow="hidden">
            <AvatarImage
              source={{ uri: item.sender.avatar }}
            />
          </Avatar>
        </Pressable>
        <View flex={1}>
          <MessageTitle {...item} />

          {item.content && <Text>{item.content}</Text>}

          <Text color="$secendory500" size="sm">
            {formatTime(item.createdAt)}
          </Text>
        </View>
        {item.source.image && (
          <Image
            borderRadius={8}
            source={{
              uri: item.source.image.src,
              width: 50,
              height: 50,
            }}
          />
        )}
      </HStack>
      <Divider />
    </>
  )
}
