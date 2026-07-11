import { Tabs, usePathname } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useThemeColor } from "heroui-native";
import { Platform } from "react-native";

import { FloatingTabBar } from "@/components/navigation/floating-tab-bar";
import { TABS } from "@/lib/config/tabs";

export default function TabsLayout() {
	const accentColor = useThemeColor("accent-soft-foreground");
	const mutedColor = useThemeColor("muted");
	const pathname = usePathname();
	const isPublishRoute = pathname === "/create";

	if (Platform.OS === "ios") {
		return (
			<NativeTabs
				hidden={isPublishRoute}
				iconColor={mutedColor}
				minimizeBehavior="onScrollDown"
				tintColor={accentColor}
			>
				{TABS.map((tab) => (
					<NativeTabs.Trigger key={tab.name} name={tab.name}>
						<NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
						<NativeTabs.Trigger.Icon
							sf={{
								default: tab.iosIconName,
								selected: tab.iosIconSelectedName,
							}}
						/>
					</NativeTabs.Trigger>
				))}
			</NativeTabs>
		);
	}

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: { display: "none" },
			}}
			tabBar={(props) => {
				const activeRoute = props.state.routes[props.state.index];
				if (activeRoute?.name === "create") {
					return null;
				}
				return <FloatingTabBar {...props} />;
			}}
		>
			<Tabs.Screen name="index" options={{ title: "发现" }} />
			<Tabs.Screen name="search" options={{ title: "搜索" }} />
			<Tabs.Screen name="create" options={{ title: "发布" }} />
			<Tabs.Screen name="messages" options={{ title: "消息" }} />
			<Tabs.Screen name="me" options={{ title: "我的" }} />
		</Tabs>
	);
}
