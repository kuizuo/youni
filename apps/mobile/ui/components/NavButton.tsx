import { ChevronLeft, Menu, Search } from '@tamagui/lucide-icons'
import type { IconProps } from '@tamagui/helpers-icon'
import { useRouter } from 'expo-router'

import { useDrawerOpen } from '@/atoms/drawer'

function BackButton({ onPress, ...props }: IconProps) {
  const router = useRouter()

  return (
    <ChevronLeft
      size="$1.5"
      onPress={(ev) => {
        if (typeof onPress === 'function') {
          onPress(ev)
          return
        }

        if (router.canGoBack())
          router.back()
        else
          router.replace('/')
      }}
      {...props}
    />
  )
}

function MenuButton(props: IconProps) {
  const [open, setOpen] = useDrawerOpen()

  return (
    <Menu
      size="$1"
      onPress={() => setOpen(true)}
      {...props}
    />
  )
}

function SearchButton(props: IconProps) {
  const router = useRouter()
  return (
    <Search size="$1" onPress={() => router.push('/search')} {...props} />
  )
}

export const NavButton = {
  Back: BackButton,
  Menu: MenuButton,
  Search: SearchButton,
}
