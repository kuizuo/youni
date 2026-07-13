export const notificationCategories = [
	"activity",
	"followers",
	"system",
] as const;

export const notificationTypes = [
	"like",
	"collect",
	"comment",
	"mention",
	"follow",
	"message",
	"announcement",
	"event",
	"system",
] as const;

export type NotificationCategory = (typeof notificationCategories)[number];
export type NotificationType = (typeof notificationTypes)[number];
