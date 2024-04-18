import { HStack, Icon, Pressable, Text } from '@gluestack-ui/themed'
import type { LucideIcon } from 'lucide-react-native'

interface Props {
  title: string
  icon?: LucideIcon
  iconAfter?: LucideIcon
  onPress?: () => void
}

export function ListItem({ title, icon, iconAfter, onPress, ...props }: Props) {
  return (
    <Pressable onPress={onPress}>
      <HStack
        alignItems="center"
        px="$4"
        py="$2.5"
        borderRadius="$md"
        gap="$2"
        {...props}
      >
        {icon && <Icon as={icon} size="md" />}
        <Text flex={1}>{title}</Text>
        {iconAfter && <Icon as={iconAfter} size="md" />}
      </HStack>
    </Pressable>
  )
}
