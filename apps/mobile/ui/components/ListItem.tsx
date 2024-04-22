import { HStack, Icon, Pressable, Text } from '@gluestack-ui/themed'
import type { LucideIcon } from 'lucide-react-native'
import { RectButton } from 'react-native-gesture-handler'

interface Props {
  title: string
  icon?: LucideIcon
  right?: React.ReactNode
  onPress?: () => void
}

export function ListItem({
  title,
  icon,
  right,
  onPress,
  ...props
}: Props) {
  return (
    <Pressable onPress={onPress}>
      <RectButton>
        <HStack
          px="$3"
          py="$2.5"
          borderRadius="$md"
          gap="$2"
          alignItems="center"
          {...props}
        >
          {icon && <Icon as={icon} size="md" />}
          <Text flex={1}>{title}</Text>
          {right && right}
        </HStack>
      </RectButton>
    </Pressable>
  )
}
