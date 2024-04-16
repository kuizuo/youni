import { ArrowLeftRight, Search } from 'lucide-react-native'
import type { Campus } from '@youni/database'
import { useState } from 'react'
import { BlurView } from 'expo-blur'
import { Adapt, Button, HStack, Input, MyView, Popover, Text, VStack } from '@/ui'
import { useCurrentCampus } from '@/atoms/campus'
import { trpc } from '@/utils/trpc'

export function SelectCampusButton() {
  const [currentCampus, setCurrentCampus] = useCurrentCampus()
  const [open, setOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  const { data, refetch } = trpc.campus.search.useQuery({ name: searchText })

  const handleSearch = (text: string) => {
    refetch()
  }

  const handleSelectCampus = (campus: Campus) => {
    setCurrentCampus(campus)
    setOpen(false)
  }

  return (
    <Popover
      size="$2"
      placement="bottom"
      allowFlip
      open={open}
      onOpenChange={setOpen}
    >
      <Popover.Trigger asChild>
        {/* <BlurView intensity={20}> */}
        <Button size="$2" bg="$color3" icon={ArrowLeftRight}>切换校区</Button>
        {/* </BlurView> */}
      </Popover.Trigger>

      <Adapt when="sm" platform="touch">
        <Popover.Sheet modal dismissOnSnapToBottom>
          <Popover.Sheet.Frame padding="$4">
            <Adapt.Contents />
          </Popover.Sheet.Frame>
          <Popover.Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Popover.Sheet>
      </Adapt>

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          'quick',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

        <VStack gap="$3">
          <HStack alignItems="center" gap="$3">
            <Input
              flex={1}
              size="$3"
              placeholder="请输入学校名称"
              onChangeText={text => setSearchText(text)}
              onSubmitEditing={() => handleSearch(searchText)}
            />
            <Search size="sm" onPress={() => handleSearch(searchText)}></Search>
          </HStack>

          <VStack gap="$2">
            {(data && data.length > 0)
              ? data?.map(campus => (
                <Text
                  key={campus.id}
                  size="md"
                  pressStyle={{
                    backgroundColor: '$gray4',
                  }}
                  onPress={() => handleSelectCampus(campus as Campus)}
                >
                  {campus.name}
                </Text>
              ))
              : (
                <Text size="md" textAlign="center">
                  未能搜索到相关学校～
                </Text>
                )}
          </VStack>
        </VStack>
      </Popover.Content>
    </Popover>

  )
}
