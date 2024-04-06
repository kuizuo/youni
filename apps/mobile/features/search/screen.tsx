import { useCallback, useRef, useState } from 'react'
import { Search } from '@tamagui/lucide-icons'
import { useAtom } from 'jotai'
import { TextInput } from 'react-native'
import { SectionList } from './components/SectionList'
import { SearchResult } from './components/SearchResult'
import { Button, Input, XStack, YStack } from '@/ui'
import { NavBar } from '@/ui/components/NavBar'
import { searchHistoryAtom } from '@/atoms/searchHistroy'
import { NavButton } from '@/ui/components/NavButton'

export function SearchScreen() {
  const [searchText, setSearchText] = useState('')
  const [isSearched, setIsSearched] = useState(false)

  const trimedSearchText = searchText.trim()

  const [searchHistory, setSearchHistory] = useAtom(searchHistoryAtom)

  const inputRef = useRef<TextInput>(null)

  const handleSubmit = useCallback(
    (text: string) => {
      const trimedText = text.trim()
      setIsSearched(true)
      setSearchText(trimedText)

      if (trimedText) {
        setSearchHistory(prev => [
          trimedText,
          ...(prev.includes(trimedText)
            ? prev.filter(o => o !== trimedText)
            : prev.slice(0, 9)),
        ])
      }
    },
    [setSearchHistory],
  )

  function SearchBar() {
    return (
      <XStack flex={1} gap="$1" ai="center" bg="$gray3" px="$2.5" py="$2" br={50}>
        <Search size="$1" />
        <Input
          ref={inputRef}
          flex={1}
          color="$color"
          size="$1"
          value={searchText}
          onChangeText={(text) => {
            if (text !== searchText) {
              setSearchText(text)
              setIsSearched(true)
            }
          }}
          onSubmitEditing={() => handleSubmit(searchText)}
          unstyled
        >
        </Input>
      </XStack>
    )
  }

  return (
    <YStack fullscreen bg="$background">
      <NavBar
        left={<NavButton.Back />}
        right={<Button color="gray" unstyled onPress={() => handleSubmit(trimedSearchText)}>搜索</Button>}
      >
        <SearchBar />
      </NavBar>

      {!isSearched
        ? (<SectionList onPressItem={item => handleSubmit(item)} />)
        : (<SearchResult searchText={trimedSearchText}></SearchResult>)}
    </YStack>
  )
}
