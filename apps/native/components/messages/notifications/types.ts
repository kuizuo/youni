import type { Ionicons } from "@expo/vector-icons";
import type { NotificationIconColor } from "@/components/messages/notification-colors";

export type NotificationKind = "comments" | "followers" | "reactions";

export type NotificationItem = {
	actor: null | {
		id: string;
		image: null | string;
		name: string;
	};
	body: string;
	createdAt: Date | string;
	id: string;
	isRead: boolean;
	kind: string;
	noteId: null | string;
	previewUrl: null | string;
	targetId: null | string;
	targetType: null | string;
	title: string;
};

export type NotificationKindConfig = {
	category: "activity" | "followers";
	emptyIcon: keyof typeof Ionicons.glyphMap;
	emptyTitle: string;
	iconColor: NotificationIconColor;
	title: string;
	types: readonly string[];
};
