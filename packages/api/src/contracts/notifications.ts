import z from "zod";

import type { NotificationsOutputs } from "./notifications-output";
import { output, procedure } from "./procedure";

export const notificationCategoryInput = z.enum([
	"all",
	"activity",
	"followers",
	"system",
]);

export const notificationTypeInput = z.enum([
	"announcement",
	"collect",
	"comment",
	"event",
	"follow",
	"like",
	"message",
	"mention",
	"system",
]);

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
