import { Stack, router } from 'expo-router';
import { Text, View } from '@/components/Themed';

import { useAuth } from '../utils/ctx';

export default function SignIn() {
  const { signIn } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen options={{ headerShown: false }}></Stack.Screen>
      
      <Text
        onPress={() => {
          signIn('token');
          // Navigate after signing in. You may want to tweak this to ensure sign-in is
          // successful before navigating.
          router.replace('/');
        }}>
        Sign In
      </Text>
    </View>
  );
}
