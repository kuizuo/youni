import type { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";

import type { NotificationIconColor } from "@/components/messages/notification-colors";

export type NotificationShortcutConfig = {
	href: Href;
	icon: keyof typeof Ionicons.glyphMap;
	iconColor: NotificationIconColor;
	id: string;
	title: string;
};
