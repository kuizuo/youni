import { Stack } from "expo-router";

function DrawerLayout() {
	return (
		<Stack>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen name="note/[id]" options={{ title: "图文详情" }} />
			<Stack.Screen name="user/[id]" options={{ title: "个人主页" }} />
		</Stack>
	);
}

export default DrawerLayout;
