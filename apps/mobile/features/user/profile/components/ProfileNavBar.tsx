import { BackButton } from "@/ui/components/BackButton"
import { NavBar } from "@/ui/components/NavBar"
import { Menu, ArrowUpRightFromSquare } from "@tamagui/lucide-icons"
import { Button } from "@/ui"

export function ProfileNavBar({ isMe }) {
  return <NavBar
    left={!isMe
      ? <BackButton />
      : <Button size={'$1'} color={'white'} icon={<Menu size={'$1'} />} unstyled />
    }
    right={<ArrowUpRightFromSquare size={'$1'} color={'white'} />}>
  </NavBar>
}