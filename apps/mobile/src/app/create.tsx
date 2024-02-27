
import { Text, View } from 'react-native';
import { Link, Stack } from 'expo-router';
export default function PublishScreen() {

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Stack.Screen options={{presentation: 'card'}}>

      </Stack.Screen>
      <Link href="/modal">Present modal</Link>
      <Text className='w-10 h-10 bg-red-400'>Box</Text>
    </View>
  );
}
