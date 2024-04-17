import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { RESET } from 'jotai/utils'
import { Trash } from 'lucide-react-native'
import { Heading, Icon, Pressable, Text, View } from '@gluestack-ui/themed'
import { searchHistoryAtom } from '@/atoms/searchHistroy'
import { NAV_BAR_HEIGHT } from '@/ui/components/NavBar'
import { confirm } from '@/utils/confirm'

export function SectionList({
  onPressItem,
}: {
  onPressItem: (item: string) => void
}) {
  const [searchHistory, setSearchHistory] = useAtom(searchHistoryAtom)

  const sections = useMemo(() => {
    return [
      {
        key: 'history',
        title: '搜索历史',
        data: searchHistory,
      },
      // {
      //   key: 'recommend',
      //   title: '猜你想搜',
      //   data: [],
      // },
    ]
  }, [searchHistory])

  return (
    <>
      {sections.map(({ key, title, data }) => {
        if (data.length === 0)
          return <></>

        return (
          <View flex={1} key={key}>
            <View h={NAV_BAR_HEIGHT} mx="$3" flexDirection="row" justifyContent="space-between" alignItems="center">
              <Heading fontSize="$md">
                {title}
              </Heading>
              <Pressable onPress={async () => {
                try {
                  await confirm('确认清除搜索历史吗')
                  setSearchHistory(RESET)
                }
                catch (error) {
                  // empty
                }
              }}
              >
                <Icon as={Trash} size="md" color="$secondary800" />
              </Pressable>
            </View>
            <View flexDirection="row" flexWrap="wrap" mx="$3" gap="$2.5">
              {data.map((item, index) => {
                return (
                  <Pressable
                    key={item}
                    bg="$backgroundLight200"
                    $dark-bg="$backgroundDark200"
                    borderRadius="$md"
                    px="$3"
                    py="$2"
                    onPress={() => {
                      onPressItem(item)
                    }}
                  >
                    <Text color="$secondary500">
                      {item}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        )
      })}
    </>
  )
}
