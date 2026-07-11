import type { SFSymbolIcon } from "expo-router/unstable-native-tabs";

import type { SingleColorIconName } from "@/components/icons/single-color";

export type TabRouteName = "index" | "search" | "create" | "messages" | "me";

export type TabIconName = Extract<
	SingleColorIconName,
	"create" | "home" | "message" | "search" | "user"
>;

export type TabIconFocusedName = Extract<
	SingleColorIconName,
	`${TabIconName}-fill`
>;
type IosTabIconName = Exclude<
	NonNullable<SFSymbolIcon["sf"]>,
	{ default?: unknown; selected: unknown }
>;

export interface TabConfig {
	iconFocusedName: TabIconFocusedName;
	iconName: TabIconName;
	iosIconName: IosTabIconName;
	iosIconSelectedName: IosTabIconName;
	isCreateAction?: boolean;
	label: string;
	name: TabRouteName;
}

export const TABS: readonly TabConfig[] = [
	{
		name: "index",
		label: "发现",
		iconName: "home",
		iconFocusedName: "home-fill",
		iosIconName: "house",
		iosIconSelectedName: "house.fill",
	},
	{
		name: "search",
		label: "搜索",
		iconName: "search",
		iconFocusedName: "search-fill",
		iosIconName: "magnifyingglass",
		iosIconSelectedName: "magnifyingglass",
	},
	{
		name: "create",
		label: "发布",
		iconName: "create",
		iconFocusedName: "create-fill",
		iosIconName: "plus.app",
		iosIconSelectedName: "plus.app.fill",
		isCreateAction: true,
	},
	{
		name: "messages",
		label: "消息",
		iconName: "message",
		iconFocusedName: "message-fill",
		iosIconName: "message",
		iosIconSelectedName: "message.fill",
	},
	{
		name: "me",
		label: "我的",
		iconName: "user",
		iconFocusedName: "user-fill",
		iosIconName: "person",
		iosIconSelectedName: "person.fill",
	},
];
