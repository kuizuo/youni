import type { NotificationShortcutConfig } from "./types";

export const HEADER_HEIGHT = 64;

export const NOTIFICATION_SHORTCUTS = [
	{
		id: "reactions",
		title: "赞和收藏",
		description: "有人喜欢或收藏了你的内容",
		icon: "heart-outline",
		href: "/notifications/reactions",
	},
	{
		id: "followers",
		title: "新增关注",
		description: "新的关注者会显示在这里",
		icon: "person-add-outline",
		href: "/notifications/followers",
	},
	{
		id: "comments",
		title: "评论",
		description: "新的评论和互动回复",
		icon: "chatbubble-ellipses-outline",
		href: "/notifications/comments",
	},
] as const satisfies readonly NotificationShortcutConfig[];
