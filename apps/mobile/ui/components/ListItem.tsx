import { HStack, Icon, Pressable, Text } from '@gluestack-ui/themed'
import type { LucideIcon } from 'lucide-react-native'

interface Props {
  icon?: LucideIcon
  iconAfter?: LucideIcon
  children: React.ReactNode
  onPress?: () => void
}

export function ListItem({ icon, iconAfter, children, onPress, ...props }: Props) {
  return (
    <Pressable onPress={onPress}>
      <HStack
        alignItems="center"
        px="$4"
        py="$2"
        borderRadius="$md"
        gap="$2"
        {...props}
      >
        {icon && <Icon as={icon} size="md" />}
        <Text flex={1}>{children}</Text>
        {iconAfter && <Icon as={iconAfter} size="md" />}
      </HStack>
    </Pressable>
  )
}
