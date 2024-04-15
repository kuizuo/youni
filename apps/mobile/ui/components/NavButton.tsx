import { ChevronLeft, Menu, Search } from 'lucide-react-native'
import type { LucideProps } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { Icon, useToken } from '@gluestack-ui/themed'
import type { ViewStyle } from 'react-native'
import { useDrawerOpen } from '@/atoms/drawer'

interface IconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xs' | undefined
  color?: string
  onPress?: (ev: any) => void
  style?: ViewStyle
}

function BackButton({ size = 'xl', color, onPress, ...props }: IconProps) {
  const router = useRouter()

  return (
    <Icon
      as={ChevronLeft}
      size={size}
      color={color}
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

function MenuButton({ size = 'xl', color, ...props }: IconProps) {
  const [open, setOpen] = useDrawerOpen()

  return (
    <Icon
      as={Menu}
      size={size}
      color={color}
      onPress={() => setOpen(true)}
      {...props}
    />
    // <Menu
    //   size={size}
    //   color={color}
    //   onPress={() => setOpen(true)}
    //   {...props}
    // />
  )
}

function SearchButton({ size = 'xl', color, ...props }: IconProps) {
  const router = useRouter()
  return (
    <Icon
      as={Search}
      size={size}
      color={color}
      onPress={() => router.push('/search')}
      {...props}
    />
  )
}

export const NavButton = {
  Back: BackButton,
  Menu: MenuButton,
  Search: SearchButton,
}
