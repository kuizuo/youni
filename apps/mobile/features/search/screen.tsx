import { useCallback, useRef, useState } from 'react'
import { Search } from 'lucide-react-native'
import { useAtom } from 'jotai'
import type { TextInput } from 'react-native'
import { Button, Input } from '@gluestack-ui/themed'
import { SectionList } from './components/SectionList'
import { SearchResult } from './components/SearchResult'
import { View } from '@/ui'
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
      <View className="flex-row flex-1 gap-1 items-center bg-gray px-2.5 py-2 rounded-full">
        <Search size="$1" />
        <Input
          ref={inputRef}
          flex={1}
          color="$color"
          size="$1"
          value={searchText}
          onChangeText={(text) => {
            if (text !== searchText)
              setSearchText(text)
              // setIsSearched(true)
          }}
          onSubmitEditing={() => handleSubmit(searchText)}
          unstyled
        >
        </Input>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <NavBar
        left={<NavButton.Back />}
        right={<Button color="gray" unstyled onPress={() => handleSubmit(trimedSearchText)}>搜索</Button>}
      >
        <SearchBar />
      </NavBar>

      {!isSearched
        ? (<SectionList onPressItem={item => handleSubmit(item)} />)
        : (<SearchResult searchText={trimedSearchText}></SearchResult>)}
    </View>
  )
}
