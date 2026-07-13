import {
	type NotificationCategory,
	type NotificationType,
	notificationCategories,
	notificationTypes,
} from "@youni/db/schema/notification-values";
import z from "zod";
import { output, procedure } from "./procedure";

// ====== Input ======

export const notificationCategoryInput = z.enum([
	"all",
	...notificationCategories,
]);

export const notificationTypeInput = z.enum(notificationTypes);

export type { NotificationCategory, NotificationType };

export const notificationListInput = z.object({
	category: notificationCategoryInput.default("all"),
	types: z.array(notificationTypeInput).max(4).optional(),
	limit: z.number().int().min(1).max(30).default(10),
	offset: z.number().int().min(0).default(0),
});

export const notificationIdInput = z.object({ id: z.string().min(1) });

export const markNotificationReadInput = notificationIdInput.extend({
	isRead: z.boolean().default(true),
});

export const notificationBulkInput = z.object({
	category: notificationCategoryInput.default("all"),
	types: z.array(notificationTypeInput).max(4).optional(),
});

export const registerPushTokenInput = z.object({
	token: z.string().min(1),
	platform: z.enum(["android", "ios", "web", "unknown"]).default("unknown"),
});

export const unregisterPushTokenInput = z.object({ token: z.string().min(1) });

// ====== Output ======

export type NotificationItem = {
	id: string;
	kind: NotificationType;
	categoryId: NotificationCategory;
	title: string;
	body: string;
	targetType: string | null;
	targetId: string | null;
	noteId: string | null;
	isRead: boolean;
	createdAt: Date;
	previewUrl: string | null;
	actor: { id: string; name: string; image: string | null } | null;
};

export type NotificationSummaryGroup = {
	id: string;
	unreadCount: number;
	updatedAt: Date | null;
};

export type NotificationsOutputs = {
	list: {
		items: NotificationItem[];
		nextOffset: number | null;
	};
	summary: {
		totalUnread: number;
		categories: [
			NotificationSummaryGroup,
			NotificationSummaryGroup,
			NotificationSummaryGroup,
		];
		messageGroups: [
			NotificationSummaryGroup,
			NotificationSummaryGroup,
			NotificationSummaryGroup,
		];
	};
	markRead: { ok: boolean };
	markAllRead: { ok: boolean };
	delete: { ok: boolean };
	deleteAll: { ok: boolean };
	registerPushToken: { id: string | null };
	unregisterPushToken: { ok: boolean };
};

// ====== Contract ======

export const notificationsContract = {
	list: procedure
		.input(notificationListInput)
		.output(output<NotificationsOutputs["list"]>()),
	summary: procedure.output(output<NotificationsOutputs["summary"]>()),
	markRead: procedure
		.input(markNotificationReadInput)
		.output(output<NotificationsOutputs["markRead"]>()),
	markAllRead: procedure
		.input(notificationBulkInput)
		.output(output<NotificationsOutputs["markAllRead"]>()),
	delete: procedure
		.input(notificationIdInput)
		.output(output<NotificationsOutputs["delete"]>()),
	deleteAll: procedure
		.input(notificationBulkInput)
		.output(output<NotificationsOutputs["deleteAll"]>()),
	registerPushToken: procedure
		.input(registerPushTokenInput)
		.output(output<NotificationsOutputs["registerPushToken"]>()),
	unregisterPushToken: procedure
		.input(unregisterPushTokenInput)
		.output(output<NotificationsOutputs["unregisterPushToken"]>()),
};
