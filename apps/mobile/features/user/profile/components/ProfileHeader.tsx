import { Button } from "@/ui"
import { MyHeader } from "@/ui/components/MyHeader"
import { ArrowUpRightFromSquare, ChevronLeft, Menu } from "@tamagui/lucide-icons"
import { router } from "expo-router"

export const ProfileHeader = ({ showBackButton }: { showBackButton: boolean }) => {

  return <MyHeader justifyContent="space-between">
    {showBackButton
      ? <Button size={'$1'} color={'white'} icon={<ChevronLeft size={'$1'} />} unstyled onPress={() => router.back()} />
      : <Button size={'$1'} color={'white'} icon={<Menu size={'$1'} />} unstyled />
    }
    <Button size={'$1'} color={'white'} icon={<ArrowUpRightFromSquare size={'$1'} />} unstyled />
  </MyHeader>
}