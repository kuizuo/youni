import type { SingleColorIconName } from "@/components/icons/single-color";

export type TabRouteName = "index" | "search" | "messages" | "create" | "me";

export type TabIconName = Extract<
	SingleColorIconName,
	"create" | "home" | "message" | "search" | "user"
>;

export type TabIconFocusedName = Extract<
	SingleColorIconName,
	`${TabIconName}-fill`
>;

export interface TabConfig {
	iconFocusedName: TabIconFocusedName;
	iconName: TabIconName;
	label: string;
	name: TabRouteName;
}

export const TABS: readonly TabConfig[] = [
	{
		name: "index",
		label: "发现",
		iconName: "home",
		iconFocusedName: "home-fill",
	},
	{
		name: "search",
		label: "搜索",
		iconName: "search",
		iconFocusedName: "search-fill",
	},
	{
		name: "messages",
		label: "消息",
		iconName: "message",
		iconFocusedName: "message-fill",
	},
	{
		name: "create",
		label: "发布",
		iconName: "create",
		iconFocusedName: "create-fill",
	},
	{
		name: "me",
		label: "我的",
		iconName: "user",
		iconFocusedName: "user-fill",
	},
];
