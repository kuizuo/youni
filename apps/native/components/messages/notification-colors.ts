export const NOTIFICATION_ICON_COLORS = {
	reactions: "danger",
	followers: "link",
	comments: "warning",
} as const;

export type NotificationIconColor =
	(typeof NOTIFICATION_ICON_COLORS)[keyof typeof NOTIFICATION_ICON_COLORS];
