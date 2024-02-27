import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function Note() {
  const { slug } = useLocalSearchParams();

  return (
    <View>
      <Stack.Screen
        options={{
          // https://reactnavigation.org/docs/headers#setting-the-header-title
          title: 'My home',
          // https://reactnavigation.org/docs/headers#adjusting-header-styles
          headerStyle: { backgroundColor: '#f4511e' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          presentation: 'modal',
        }}
      />
      <Text>Blog post: {slug}</Text>
    </View>

  );
}