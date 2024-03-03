import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/ui';

export default function Screen() {
  const { id } = useLocalSearchParams();

  return <Text>User : {id}</Text>;
}