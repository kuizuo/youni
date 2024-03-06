import { ProfileScreen } from '@/features/profile/screen';
import { Stack } from 'expo-router';

export default function Screen() {
  return (
    <>
      <Stack.Screen />
      <ProfileScreen />
    </>
  );
}