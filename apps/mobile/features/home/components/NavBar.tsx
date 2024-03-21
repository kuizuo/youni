import { Button, XStack } from "tamagui"
import { SearchBar } from "./SearchBar"
import { Menu } from "@tamagui/lucide-icons"
import React from "react"
import { useDrawerOpen } from "@/atoms/drawer"
import { MyHeader } from "@/ui/components/MyHeader"

interface Props {
  children?: React.ReactNode
}

export function NavBar({ children }: Props) {

  const [open, setOpen] = useDrawerOpen()

  return <MyHeader width={'100%'} alignItems="center" gap="0">
    <Button icon={<Menu size='$1' />} onPress={() => setOpen(true)} unstyled></Button>

    <SearchBar ></SearchBar>
  </MyHeader>
}
