import { Drawer } from 'react-native-drawer-layout'
import { useDrawerOpen } from '@/atoms/drawer'
import CustomDrawerContent from '@/ui/components/CustomDrawerContent'

export function DrawerContainer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDrawerOpen()

  return (
    <Drawer
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      swipeEnabled={false}
      renderDrawerContent={() => <CustomDrawerContent></CustomDrawerContent>}
    >
      {children}
    </Drawer>
  )
}
