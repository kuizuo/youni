import { Text } from "react-native";
import { Stack } from "expo-router";

export function CampusScreen() {
  return (
    <>
      <Stack.Screen options={{
        headerShown: true
      }} />
      <Text>
        校园广场 实现中
      </Text>
    </>
  );
};
