import { NOTIFICATION_ICON_COLORS } from "@/components/messages/notification-colors";
import type { NotificationKind, NotificationKindConfig } from "./types";

export const NOTIFICATION_KIND_CONFIG = {
	reactions: {
		title: "赞和收藏",
		emptyIcon: "heart-outline",
		emptyTitle: "收到的赞和收藏会出现在这里",
		iconColor: NOTIFICATION_ICON_COLORS.reactions,
		types: ["like", "collect"] as const,
		category: "activity" as const,
	},
	followers: {
		title: "新增关注",
		emptyIcon: "person-add-outline",
		emptyTitle: "有新朋友关注你时，会显示在这里",
		iconColor: NOTIFICATION_ICON_COLORS.followers,
		types: ["follow"] as const,
		category: "followers" as const,
	},
	comments: {
		title: "评论",
		emptyIcon: "chatbubble-ellipses-outline",
		emptyTitle: "收到的评论会出现在这里",
		iconColor: NOTIFICATION_ICON_COLORS.comments,
		types: ["comment"] as const,
		category: "activity" as const,
	},
} satisfies Record<NotificationKind, NotificationKindConfig>;
