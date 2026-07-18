import { Tabs, usePathname } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useThemeColor } from "heroui-native";
import { Platform, View } from "react-native";

import { FloatingTabBar } from "@/components/navigation/floating-tab-bar";
import { PublishFAB } from "@/components/shared/publish-fab";
import { shouldShowTabBar } from "@/lib/config/tab-bar-visibility";
import { TABS } from "@/lib/config/tabs";

export default function TabsLayout() {
	const accentColor = useThemeColor("accent-soft-foreground");
	const mutedColor = useThemeColor("muted");
	const pathname = usePathname();
	const showTabBar = shouldShowTabBar(pathname);

	if (Platform.OS === "ios") {
		return (
			<View className="flex-1">
				<NativeTabs
					hidden={!showTabBar}
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
				{showTabBar ? <PublishFAB /> : null}
			</View>
		);
	}

	return (
		<View className="flex-1">
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarStyle: { display: "none" },
				}}
				tabBar={(props) => {
					if (!showTabBar) {
						return null;
					}
					return <FloatingTabBar {...props} />;
				}}
			>
				<Tabs.Screen name="index" options={{ title: "发现" }} />
				<Tabs.Screen name="search" options={{ title: "搜索" }} />
				<Tabs.Screen name="messages" options={{ title: "消息" }} />
				<Tabs.Screen name="me" options={{ title: "我的" }} />
			</Tabs>
			{showTabBar ? <PublishFAB /> : null}
		</View>
	);
}
