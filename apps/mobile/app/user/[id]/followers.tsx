import { ProfileScreen } from '@/features/profile/screen';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from '@/ui'
export default function Screen() {

  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen />
      <Text>123 {id}</Text>
    </>
  );
}