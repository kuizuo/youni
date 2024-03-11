import { Stack } from 'expo-router';
import { SearchScreen } from '@/features/search/screen';

export default function Screen() {
  return (
    <>
      <Stack.Screen />
      <SearchScreen />
    </>
  );
}