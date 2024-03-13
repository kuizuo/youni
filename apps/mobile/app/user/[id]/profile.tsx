import { ProfileScreen } from '@/features/user/profile/screen';
import { Stack } from 'expo-router';

export default function Screen() {
  return (
    <>
      <Stack.Screen />
      <ProfileScreen />
    </>
  );
}