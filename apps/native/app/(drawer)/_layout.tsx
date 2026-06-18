import { Stack } from "expo-router";

function DrawerLayout() {
	return (
		<Stack>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen name="note/[id]" options={{ headerShown: false }} />
			<Stack.Screen name="user/[id]" options={{ headerShown: false }} />
		</Stack>
	);
}

export default DrawerLayout;
