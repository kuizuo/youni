import { useRouter } from "expo-router"
import { XStack, Button, XStackProps, View, } from "@/ui"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import React from "react"
import { ChevronLeft } from "@tamagui/lucide-icons"

interface Props extends XStackProps {
  showBackButton?: boolean
  children?: React.ReactNode
}

export const MyHeader = ({ showBackButton, children, ...props }: Props): React.ReactNode => {
  const router = useRouter()
  const { top } = useSafeAreaInsets()

  return <XStack width={'100%'} padding='$3' paddingTop={top || '$3'} gap={'$2.5'} alignItems="center" {...props} >
    {showBackButton && <Button icon={<ChevronLeft size={'$1.5'} />} unstyled onPress={() => router.back()} />}
    {children}
  </XStack>
}