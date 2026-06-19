import { Tabs } from "expo-router";

import { FloatingTabBar } from "@/components/navigation/floating-tab-bar";

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: { display: "none" },
			}}
			tabBar={(props) => <FloatingTabBar {...props} />}
		>
			<Tabs.Screen name="index" options={{ title: "发现" }} />
			<Tabs.Screen name="search" options={{ title: "搜索" }} />
			<Tabs.Screen name="create" options={{ title: "发布" }} />
			<Tabs.Screen name="me" options={{ title: "我的" }} />
		</Tabs>
	);
}
