import { NOTIFICATION_ICON_COLORS } from "@/components/messages/notification-colors";
import type { NotificationKind, NotificationKindConfig } from "./types";

export const NOTIFICATION_KIND_CONFIG = {
	reactions: {
		title: "赞和收藏",
		emptyIcon: "heart-outline",
		emptyTitle: "还没有赞和收藏",
		iconColor: NOTIFICATION_ICON_COLORS.reactions,
		types: ["like", "collect"] as const,
		category: "activity" as const,
	},
	followers: {
		title: "新增关注",
		emptyIcon: "person-add-outline",
		emptyTitle: "还没有新增关注",
		iconColor: NOTIFICATION_ICON_COLORS.followers,
		types: ["follow"] as const,
		category: "followers" as const,
	},
	comments: {
		title: "评论",
		emptyIcon: "chatbubble-ellipses-outline",
		emptyTitle: "还没有评论消息",
		iconColor: NOTIFICATION_ICON_COLORS.comments,
		types: ["comment"] as const,
		category: "activity" as const,
	},
} satisfies Record<NotificationKind, NotificationKindConfig>;
