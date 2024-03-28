import { Menu } from '@tamagui/lucide-icons'
import { SearchBar } from './SearchBar'
import { NavBar } from '@/ui/components/NavBar'
import { useDrawerOpen } from '@/atoms/drawer'

export function HomeHeader() {
  const [open, setOpen] = useDrawerOpen()

  return (
    <>
      <NavBar left={<Menu size="$1" onPress={() => setOpen(true)} />}>
        <SearchBar></SearchBar>
      </NavBar>
    </>
  )
}
