import type { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";

import type { NotificationIconColor } from "@/components/messages/notification-colors";

export type ConversationItem = {
	id: string;
	lastMessage: null | {
		content: string;
		createdAt: Date | string;
		id: string;
		senderId: string;
	};
	peer: {
		bio: null | string;
		email: string;
		handle: null | string;
		id: string;
		image: null | string;
		name: string;
	};
	unreadCount: number;
	updatedAt: Date | string;
};

export type MessageGroupSummary = {
	id: string;
	unreadCount: number;
};

export type NotificationShortcutConfig = {
	href: Href;
	icon: keyof typeof Ionicons.glyphMap;
	iconColor: NotificationIconColor;
	id: string;
	title: string;
};
