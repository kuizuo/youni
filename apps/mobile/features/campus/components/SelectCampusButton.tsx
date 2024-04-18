import { ArrowLeftRight, Search, X } from 'lucide-react-native'
import type { Campus } from '@youni/database'
import { useState } from 'react'
import {
  Button,
  ButtonIcon,
  ButtonText,
  HStack,
  Icon,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  Popover,
  PopoverArrow,
  PopoverBackdrop,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  Pressable,
  Text,
  VStack,
  View,
} from '@gluestack-ui/themed'
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
      size="sm"
      isOpen={open}
      placement="bottom"
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      trigger={(triggerProps) => {
        return (
          <Button {...triggerProps} size="xs" gap="$1" variant="outline">
            <ButtonIcon as={ArrowLeftRight} />
            <ButtonText>切换校区</ButtonText>
          </Button>
        )
      }}
    >
      <PopoverBackdrop />
      <PopoverContent>
        <PopoverArrow />
        <PopoverHeader>
          <HStack width="$full" mx="$2">
            <Input flex={1} variant="rounded" size="sm" mb="$2">
              <InputSlot pl="$3">
                <InputIcon as={Search} />
              </InputSlot>
              <InputField
                className="px-2"
                placeholder="请输入学校名称"
                onChangeText={(text) => {
                  if (text !== searchText)
                    setSearchText(text.trim())
                }}
                textAlignVertical="center"
                onSubmitEditing={() => handleSearch(searchText)}
                autoFocus={true}
              />

            </Input>
            <PopoverCloseButton>
              <Icon as={X} />
            </PopoverCloseButton>
          </HStack>
        </PopoverHeader>
        <PopoverBody>
          <VStack gap="$2">
            {(data && data.length > 0)
              ? data?.map(campus => (
                <Pressable
                  key={campus.id}
                  flex={1}
                  $hover-bg="$truGray400"
                  $pressed-bg="$truGray600"
                  onPress={() => handleSelectCampus(campus as Campus)}
                >
                  <Text size="md">
                    {campus.name}
                  </Text>
                </Pressable>
              ))
              : (
                <Text size="md" textAlign="center">
                  未能搜索到相关学校～
                </Text>
                )}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
