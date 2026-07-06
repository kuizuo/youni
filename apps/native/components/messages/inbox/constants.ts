import { NOTIFICATION_ICON_COLORS } from "@/components/messages/notification-colors";
import type { NotificationShortcutConfig } from "./types";

export const HEADER_HEIGHT = 64;

export const NOTIFICATION_SHORTCUTS = [
	{
		id: "reactions",
		title: "赞和收藏",
		icon: "heart-outline",
		iconColor: NOTIFICATION_ICON_COLORS.reactions,
		href: "/notifications/reactions",
	},
	{
		id: "followers",
		title: "关注",
		icon: "person-add-outline",
		iconColor: NOTIFICATION_ICON_COLORS.followers,
		href: "/notifications/followers",
	},
	{
		id: "comments",
		title: "评论",
		icon: "chatbubble-ellipses-outline",
		iconColor: NOTIFICATION_ICON_COLORS.comments,
		href: "/notifications/comments",
	},
] as const satisfies readonly NotificationShortcutConfig[];
