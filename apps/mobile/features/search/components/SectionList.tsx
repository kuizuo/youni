import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { RESET } from 'jotai/utils'
import { Trash } from 'lucide-react-native'
import { searchHistoryAtom } from '@/atoms/searchHistroy'
import { Text, View } from '@/ui'
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
            <View h={NAV_BAR_HEIGHT} mx="$3" fd="row" jc="space-between" ai="center">
              <Text color="$gray9">
                {title}
              </Text>
              <Trash
                color="$gray9"
                size="$1"
                onPress={async () => {
                  try {
                    await confirm('确认清除搜索历史吗')
                    setSearchHistory(RESET)
                  }
                  catch (error) {
                    // empty
                  }
                }}
              />
            </View>
            <View fd="row" fw="wrap" mx="$3" gap="$2.5">
              {data.map((item, index) => {
                return (
                  <View
                    key={item}
                    bg="$color4"
                    br="$3"
                    px="$3"
                    py="$2"
                    onPress={() => {
                      onPressItem(item)
                    }}
                  >
                    <Text color="$gray11">
                      {item}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        )
      }) }
    </>
  )
}
