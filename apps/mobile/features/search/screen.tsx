import type { ElementRef } from 'react'
import { useCallback, useRef, useState } from 'react'
import { Search } from 'lucide-react-native'
import { useAtom } from 'jotai'
import { TextInput } from 'react-native'
import { Icon, Input, Pressable, Text, View } from '@gluestack-ui/themed'
import { SectionList } from './components/SectionList'
import { SearchResult } from './components/SearchResult'
import { NavBar } from '@/ui/components/NavBar'
import { searchHistoryAtom } from '@/atoms/searchHistroy'
import { NavButton } from '@/ui/components/NavButton'

export function SearchScreen() {
  const [searchText, setSearchText] = useState('')
  const [isSearched, setIsSearched] = useState(false)

  const trimedSearchText = searchText.trim()
  const [placeholder] = useState('搜索你所感兴趣的')
  const [searchHistory, setSearchHistory] = useAtom(searchHistoryAtom)

  const inputRef = useRef<ElementRef<typeof TextInput>>(null)

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

  return (
    <View flex={1}>
      <NavBar
        left={<NavButton.Back />}
        right={(
          <Pressable onPress={() => handleSubmit(trimedSearchText)}>
            <Text size="sm" color="$secondary600">搜索</Text>
          </Pressable>
        )}
      >
        <View
          flex={1}
          flexDirection="row"
          gap="$1"
          alignItems="center"
          px="$2.5"
          py="$2"
          borderRadius="$full"
          bg="$backgroundLight200"
          $dark-bg="$backgroundDark200"
        >
          <Icon as={Search} size="md" />
          <TextInput
            ref={inputRef}
            value={searchText}
            placeholder={placeholder}
            onChangeText={(text) => {
              if (text !== searchText)
                setSearchText(text)
              // setIsSearched(true)
            }}
            onSubmitEditing={() => handleSubmit(searchText)}
          >
          </TextInput>
        </View>
      </NavBar>

      {!isSearched
        ? (<SectionList onPressItem={item => handleSubmit(item)} />)
        : (<SearchResult searchText={trimedSearchText}></SearchResult>)}
    </View>
  )
}
