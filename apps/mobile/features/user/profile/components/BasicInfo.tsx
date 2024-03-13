import { Avatar, XStack, YStack, SizableText, Paragraph, Image, Theme } from "@/ui"
import { UserInfo } from "@server/modules/user/user"

export const BasicInfo = ({ data }: { data: UserInfo }) => {
  return <>
    <XStack gap='$4' marginHorizontal='$4' >
      <Avatar circular size="$8">
        <Avatar.Image
          width="100%"
          height="100%"
          // @ts-ignore
          source={{
            uri: data.avatar
          }}
        />
        <Avatar.Fallback />
      </Avatar>
      <YStack flex={1} >
        <XStack gap="$2" alignItems='center'>
          <SizableText size={16}>
            {data.nickname}
          </SizableText>

          {data.gender ?
            <Image
              source={data.gender === 1 ? require('@/assets/icons/male.png') : require('@/assets/icons/female.png')}
              width={20}
              height={20}
            /> : <></>
          }
        </XStack>
      </YStack>
    </XStack >

    <XStack marginHorizontal="$4">
      <Paragraph>{data.desc ?? '暂无简介'}</Paragraph>
    </XStack>
  </>
}