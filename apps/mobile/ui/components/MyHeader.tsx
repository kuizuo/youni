import { useRouter } from "expo-router"
import { XStack, Button, XStackProps, View, } from "@/ui"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import React from "react"
import { ChevronLeft } from "@tamagui/lucide-icons"

interface Props extends XStackProps {
  showBackButton?: boolean
  children?: React.ReactNode
  headerLeft?: React.ReactNode
  headerRight?: React.ReactNode
}

export const MyHeader = ({
  showBackButton,
  headerLeft,
  headerRight,
  children,
  ...props
}: Props): React.ReactNode => {
  const router = useRouter()
  const { top } = useSafeAreaInsets()

  return <XStack width={'100%'} padding='$3' paddingTop={top || '$3'} gap={'$2.5'} alignItems="center" {...props} >
    {headerLeft ? headerLeft : showBackButton && <Button alignSelf="flex-start" icon={<ChevronLeft size={'$1.5'} />} unstyled onPress={() => router.back()} />}
    {children}
    {headerRight}
  </XStack>
}