import type { Ionicons } from "@expo/vector-icons";
import type {
	NotificationCategory,
	NotificationType,
} from "@youni/api/contracts/notifications";
import type { NotificationIconColor } from "@/components/messages/notification-colors";

export type NotificationKind = "comments" | "followers" | "reactions";

export type NotificationKindConfig = {
	category: Exclude<NotificationCategory, "system">;
	emptyIcon: keyof typeof Ionicons.glyphMap;
	emptyTitle: string;
	iconColor: NotificationIconColor;
	title: string;
	types: readonly NotificationType[];
};
