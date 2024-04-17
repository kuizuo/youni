import { useLocalSearchParams } from 'expo-router'
import { Text } from '@gluestack-ui/themed'

export default function Screen() {
  const { id } = useLocalSearchParams()

  return (
    <Text>
      Chat :
      {id}
    </Text>
  )
}
