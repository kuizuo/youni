import React from "react"
import { XStack, Avatar, YStack, SizableText, Text, Image, Separator } from "tamagui"
import { MessageItem } from '@server/modules/notification/notification'
import { Link, useRouter } from "expo-router"
import { formatTime } from "@/utils/date"

export const MessageListItem = (item: MessageItem): React.ReactNode => {
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
        User: '关注了你'
      },
      System: {
        Notice: '系统通知'
      }
    };

    const actionString = actionMap[item.action][item.sourceType];

    return <XStack gap="$2">
      <Link href={`/user/${item.sender.id}/profile`} asChild>
        <SizableText size="$4">
          {item.sender.nickname}
        </SizableText>
      </Link>

      <SizableText size="$4" color={'gray'}>
        {actionString}
      </SizableText>

      {(item.sourceId && item.sourceType === 'Note') && (
        <Link href={`/note/${item.sourceId}`} asChild>
          <SizableText size="$4">{item.source.title}</SizableText>
        </Link>
      )}
    </XStack>
  }

  const goToUser = (id: string) => {
    router.push(`/user/${id}/profile`)
  }

  return <>
    <XStack padding='$3' gap='$3' alignItems='center'>
      <Avatar circular size="$5" onPress={() => goToUser(item.sender.id)}>
        <Avatar.Image
          width="100%"
          height="100%"
          // @ts-ignore
          source={{
            uri: item.sender.avatar
          }}
        />
        <Avatar.Fallback />
      </Avatar>
      <YStack flex={1}>
        <MessageTitle></MessageTitle>

        {item.content && <Text>{item.content}</Text>}

        <SizableText size='$1' color={'gray'}>
          {formatTime(item.createdAt)}
        </SizableText>
      </YStack>
      {item.source.image && <Image
        borderRadius='$2'
        source={{
          uri: item.source.image.src,
          width: 50,
          height: 50
        }}
      />}
    </XStack>
    <Separator />
  </>
}

