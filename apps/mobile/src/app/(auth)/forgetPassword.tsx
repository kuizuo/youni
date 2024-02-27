import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { Text, View } from 'react-native';


export default function Screen() {
  return (
    <View >
      <Stack.Screen options={{ headerTitle: '' }}></Stack.Screen>
      <Text>忘记密码</Text>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
