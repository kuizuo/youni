
import { Text, View } from '@youni/ui';
import { Link, Stack } from 'expo-router';
export default function PublishScreen() {

  return (
    <View >
      <Stack.Screen options={{ presentation: 'card' }}>

      </Stack.Screen>
      <Link href="/modal">Present modal</Link>
      <Text>Box</Text>
    </View>
  );
}
